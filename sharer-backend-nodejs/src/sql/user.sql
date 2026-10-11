-- =============================================
-- 用户表
-- 数据库：sharer
-- 说明：资源共享平台用户信息表
-- =============================================

CREATE DATABASE IF NOT EXISTS `sharer`
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `sharer`;

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID（主键）',
    `username`    VARCHAR(50)     NOT NULL                COMMENT '用户昵称',
    `account`     VARCHAR(50)     NOT NULL                COMMENT '登录账号',
    `password`    VARCHAR(255)    NOT NULL                COMMENT '密码（bcrypt加密后的哈希值）',
    `avatar`      VARCHAR(255)    NULL DEFAULT NULL       COMMENT '头像URL',
    `email`       VARCHAR(100)    NULL DEFAULT NULL       COMMENT '邮箱',
    `status`      TINYINT         NOT NULL DEFAULT 1      COMMENT '状态：1-正常 0-禁用',
    `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_account` (`account`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_email` (`email`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '用户表';
