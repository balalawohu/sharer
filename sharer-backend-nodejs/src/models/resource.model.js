// Model：资源模型（对应 resource 表）
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Resource = sequelize.define(
    'Resource',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            comment: '资源ID（主键）'
        },
        user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: '上传者ID'
        },
        title: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: '资源标题'
        },
        description: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: '资源描述'
        },
        resource_type: {
            type: DataTypes.STRING(20),
            allowNull: false,
            comment: '资源类型：image/audio/video/other'
        },
        mime_type: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: '文件 MIME 类型'
        },
        file_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: '存储后的文件名'
        },
        origin_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: '上传时的原始文件名'
        },
        file_path: {
            type: DataTypes.STRING(500),
            allowNull: false,
            comment: '文件相对存储路径'
        },
        file_size: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
            comment: '文件大小（字节）'
        },
        tags: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '标签，多个用逗号分隔'
        },
        visibility: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '可见性：1-公开 0-私有'
        },
        download_count: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
            comment: '下载次数'
        },
        view_count: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
            comment: '浏览次数'
        },
        status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '状态：1-正常 0-已删除'
        }
    },
    {
        tableName: 'resource',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
    }
);

export default Resource;
