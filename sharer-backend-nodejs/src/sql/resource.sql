-- =============================================
-- 资源表
-- 数据库：sharer
-- 说明：资源共享平台上传的资源文件记录（表情包/音频/视频等）
-- =============================================

USE `sharer`;

DROP TABLE IF EXISTS `resource`;

CREATE TABLE `resource` (
    `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '资源ID（主键）',
    `user_id`        BIGINT UNSIGNED NOT NULL                COMMENT '上传者ID（关联 user.id）',
    `title`          VARCHAR(100)    NOT NULL                COMMENT '资源标题',
    `description`    VARCHAR(500)    NULL DEFAULT NULL       COMMENT '资源描述',
    `resource_type`  VARCHAR(20)     NOT NULL                COMMENT '资源类型：image/audio/video/other',
    `mime_type`      VARCHAR(100)    NOT NULL                COMMENT '文件 MIME 类型',
    `file_name`      VARCHAR(255)    NOT NULL                COMMENT '存储后的文件名',
    `origin_name`    VARCHAR(255)    NOT NULL                COMMENT '上传时的原始文件名',
    `file_path`      VARCHAR(500)    NOT NULL                COMMENT '文件在服务端的相对存储路径',
    `file_size`      BIGINT UNSIGNED NOT NULL DEFAULT 0      COMMENT '文件大小（字节）',
    `tags`           VARCHAR(255)    NULL DEFAULT NULL       COMMENT '标签，多个用逗号分隔',
    `visibility`     TINYINT         NOT NULL DEFAULT 1      COMMENT '可见性：1-公开 0-私有',
    `download_count` INT UNSIGNED    NOT NULL DEFAULT 0      COMMENT '下载次数',
    `view_count`     INT UNSIGNED    NOT NULL DEFAULT 0      COMMENT '浏览次数',
    `status`         TINYINT         NOT NULL DEFAULT 1      COMMENT '状态：1-正常 0-已删除',
    `created_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_resource_user` (`user_id`),
    KEY `idx_resource_type` (`resource_type`),
    KEY `idx_resource_visibility` (`visibility`),
    CONSTRAINT `fk_resource_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '资源表';
