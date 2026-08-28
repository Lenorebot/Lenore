// ===================================================
// File: src/database/DatabaseManager.js
// الوصف: مدير قاعدة بيانات JSON محلية لكل سيرفر مع Cache وDebounced Writes
//        ومعالجة الملفات التالفة ونسخ احتياطي تلقائي.
// ===================================================

const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('../utils/logger');
const { cloneDefaultSchema } = require('./schema');

const GUILDS_DIR = path.join(process.cwd(), config.paths.guildsDir);
const BACKUPS_DIR = path.join(process.cwd(), config.paths.backupsDir);

class DatabaseManager {
    constructor() {
        /** @type {Map<string, object>} كاش الإعدادات في الذاكرة (guildId -> config) */
        this.cache = new Map();
        /** @type {Map<string, NodeJS.Timeout>} مؤقتات الكتابة المؤجلة (Debounce) */
        this._writeTimers = new Map();
        /** @type {Set<string>} سيرفرات لديها تغييرات لم تُكتب على القرص بعد */
        this._dirty = new Set();

        this._ensureDirectories();

        // ضمان حفظ أي بيانات معلّقة قبل إغلاق العملية
        process.on('beforeExit', () => this.flushAll());
        process.on('SIGINT', () => { this.flushAll(); process.exit(0); });
        process.on('SIGTERM', () => { this.flushAll(); process.exit(0); });
    }

    _ensureDirectories() {
        for (const dir of [GUILDS_DIR, BACKUPS_DIR]) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                logger.info('Database', `تم إنشاء المجلد: ${dir}`);
            }
        }
    }

    _filePath(guildId) {
        return path.join(GUILDS_DIR, `${guildId}.json`);
    }

    _backupPath(guildId) {
        const stamp = Date.now();
        return path.join(BACKUPS_DIR, `${guildId}.${stamp}.json`);
    }

    /**
     * قراءة إعدادات سيرفر من القرص مباشرة (Bypass للكاش)، مع معالجة الملفات التالفة.
     */
    _readFromDisk(guildId) {
        const filePath = this._filePath(guildId);

        if (!fs.existsSync(filePath)) {
            return null;
        }

        try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            if (!raw || raw.trim().length === 0) {
                throw new Error('الملف فارغ');
            }
            return JSON.parse(raw);
        } catch (err) {
            logger.error('Database', `ملف تالف لدى السيرفر ${guildId}, سيتم عمل نسخة احتياطية وإعادة الإنشاء`, { error: err.message });

            // عمل نسخة من الملف التالف قبل استبداله حتى لا تُفقد البيانات نهائيًا
            try {
                const corruptBackup = path.join(BACKUPS_DIR, `${guildId}.corrupted.${Date.now()}.json`);
                fs.copyFileSync(filePath, corruptBackup);
            } catch (copyErr) {
                logger.error('Database', 'فشل عمل نسخة احتياطية من الملف التالف', { error: copyErr.message });
            }

            return null;
        }
    }

    /**
     * جلب إعدادات سيرفر (من الكاش إن وجدت، وإلا من القرص، وإلا يتم إنشاء إعدادات افتراضية).
     */
    getGuildConfig(guildId) {
        if (this.cache.has(guildId)) {
            return this.cache.get(guildId);
        }

        let data = this._readFromDisk(guildId);

        if (!data) {
            data = cloneDefaultSchema(guildId);
            this.cache.set(guildId, data);
            this._scheduleWrite(guildId);
            logger.info('Database', `تم إنشاء إعدادات افتراضية جديدة للسيرفر ${guildId}`);
            return data;
        }

        // دمج الإعدادات المقروءة مع الهيكل الافتراضي لضمان وجود أي حقول جديدة أُضيفت لاحقًا للنظام
        const merged = this._mergeWithDefaults(data, guildId);
        this.cache.set(guildId, merged);
        return merged;
    }

    /**
     * دمج عميق بين البيانات المخزنة والهيكل الافتراضي (يحافظ على قيم المستخدم ويضيف الحقول الناقصة فقط).
     */
    _mergeWithDefaults(stored, guildId) {
        const defaults = cloneDefaultSchema(guildId);

        const deepMerge = (target, source) => {
            const output = { ...target };
            for (const key of Object.keys(source)) {
                if (
                    source[key] &&
                    typeof source[key] === 'object' &&
                    !Array.isArray(source[key]) &&
                    target[key] &&
                    typeof target[key] === 'object'
                ) {
                    output[key] = deepMerge(target[key], source[key]);
                } else if (source[key] !== undefined) {
                    output[key] = source[key];
                }
            }
            return output;
        };

        const merged = deepMerge(defaults, stored);
        merged.guildId = guildId;
        merged.createdAt = stored.createdAt || defaults.createdAt;
        return merged;
    }

    /**
     * تحديث جزء من إعدادات السيرفر عبر دالة تعديل (updater) تستقبل الكائن الحالي وتعدّله مباشرة.
     * لا يحذف أي بيانات أخرى غير المذكورة.
     */
    updateGuildConfig(guildId, updater) {
        const current = this.getGuildConfig(guildId);
        updater(current);
        current.updatedAt = new Date().toISOString();
        this.cache.set(guildId, current);
        this._scheduleWrite(guildId);
        return current;
    }

    /**
     * إعادة تعيين إعدادات سيرفر بالكامل إلى القيم الافتراضية.
     */
    resetGuildConfig(guildId) {
        const fresh = cloneDefaultSchema(guildId);
        this.cache.set(guildId, fresh);
        this._scheduleWrite(guildId, /* immediate */ true);
        logger.info('Database', `تمت إعادة تعيين إعدادات السيرفر ${guildId}`);
        return fresh;
    }

    /**
     * جدولة كتابة مؤجلة (Debounced) لتقليل عمليات I/O عند تعديلات متكررة ومتقاربة.
     */
    _scheduleWrite(guildId, immediate = false) {
        this._dirty.add(guildId);

        if (this._writeTimers.has(guildId)) {
            clearTimeout(this._writeTimers.get(guildId));
        }

        const delay = immediate ? 0 : config.cache.writeDebounceMs;

        const timer = setTimeout(() => {
            this._writeTimers.delete(guildId);
            this._persist(guildId);
        }, delay);

        this._writeTimers.set(guildId, timer);
    }

    /**
     * كتابة فعلية وآمنة على القرص (Atomic Write عبر ملف مؤقت ثم استبدال).
     */
    _persist(guildId) {
        const data = this.cache.get(guildId);
        if (!data) return;

        const filePath = this._filePath(guildId);
        const tempPath = `${filePath}.tmp`;

        try {
            fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
            fs.renameSync(tempPath, filePath); // عملية استبدال ذرّية تمنع تلف الملف عند الانقطاع المفاجئ
            this._dirty.delete(guildId);
            logger.debug('Database', `تم حفظ إعدادات السيرفر ${guildId} على القرص`);
        } catch (err) {
            logger.error('Database', `فشل حفظ إعدادات السيرفر ${guildId}`, { error: err.message });
        }
    }

    /**
     * إنشاء نسخة احتياطية فورية من إعدادات سيرفر معيّن (يُستخدم قبل عمليات حساسة مثل Reset).
     */
    createBackup(guildId) {
        const filePath = this._filePath(guildId);
        if (!fs.existsSync(filePath)) return null;

        const backupPath = this._backupPath(guildId);
        try {
            fs.copyFileSync(filePath, backupPath);
            logger.info('Database', `تم إنشاء نسخة احتياطية لإعدادات السيرفر ${guildId}`);
            return backupPath;
        } catch (err) {
            logger.error('Database', 'فشل إنشاء نسخة احتياطية', { error: err.message });
            return null;
        }
    }

    /**
     * كتابة كل التغييرات المعلّقة فورًا (يُستخدم عند إيقاف تشغيل البوت).
     */
    flushAll() {
        for (const guildId of this._dirty) {
            if (this._writeTimers.has(guildId)) {
                clearTimeout(this._writeTimers.get(guildId));
                this._writeTimers.delete(guildId);
            }
            this._persist(guildId);
        }
    }

    /**
     * حذف سيرفر من الكاش (يُستخدم عند مغادرة البوت للسيرفر - لا يحذف الملف نفسه للحفاظ على البيانات).
     */
    unloadFromCache(guildId) {
        this.cache.delete(guildId);
    }
}

// Singleton واحد يُستخدم في كل المشروع
module.exports = new DatabaseManager();
