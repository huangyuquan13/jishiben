-- ============================================
--  记账小工具 - MySQL 建表 & 初始化数据
--  使用方法: mysql -u root -p jizhang < init.sql
--  注意: H2 模式不需要此文件,JPA自动建表
--  切换 MySQL 时: 先执行此文件建表,再取消 application.yml 中 MySQL 注释
-- ============================================

CREATE DATABASE IF NOT EXISTS jizhang
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE jizhang;

-- 账单表
DROP TABLE IF EXISTS t_bill;
CREATE TABLE t_bill (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    type        VARCHAR(20)  NOT NULL COMMENT 'expense/income',
    amount      DOUBLE       NOT NULL COMMENT '金额',
    category    VARCHAR(50)  NOT NULL COMMENT '分类代码',
    category_name VARCHAR(50) NOT NULL COMMENT '分类名称',
    category_icon VARCHAR(10)          COMMENT '分类图标',
    date        DATE         NOT NULL COMMENT '日期 YYYY-MM-DD',
    note        VARCHAR(100)          COMMENT '备注',
    create_time BIGINT       NOT NULL COMMENT '创建时间戳'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账单表';

-- 初始数据（与前端模拟数据一致）
INSERT INTO t_bill (type, amount, category, category_name, category_icon, date, note, create_time)
VALUES
('expense', 35.00,  'food',        '餐饮', '🍜', '2026-07-07', '午餐麻辣烫外卖',       1720336200000),
('expense', 8.00,   'transport',   '交通', '🚌', '2026-07-07', '地铁出行',             1720302300000),
('expense', 156.00, 'shopping',    '购物', '🛒', '2026-07-06', '优衣库夏装短袖',       1720248000000),
('income',  8500.00,'salary',      '工资', '💰', '2026-07-05', '6月份基本工资发放',     1720166400000),
('expense', 120.00, 'entertainment','娱乐', '🎮', '2026-07-04', 'Steam夏季大促买游戏',  1720080000000),
('expense', 45.00,  'food',        '餐饮', '🍜', '2026-07-03', '晚上和同事聚餐AA',      1719993600000),
('expense', 15.00,  'transport',   '交通', '🚌', '2026-07-02', '打车回家',             1719907200000),
('expense', 2200.00,'housing',     '住房', '🏠', '2026-07-01', '7月份房租扣款',         1719820800000),
('expense', 65.00,  'food',        '餐饮', '🍜', '2026-06-28', '海底捞火锅',           1719572400000),
('expense', 49.00,  'shopping',    '购物', '🛒', '2026-06-25', '生活日用品购买',        1719313200000),
('income',  8500.00,'salary',      '工资', '💰', '2026-06-05', '5月份基本工资发放',     1717596000000),
('expense', 300.00, 'education',   '教育', '🎓', '2026-06-15', '网课学习教材',          1718457600000);

SELECT '初始化完成！共 ' || COUNT(*) || ' 条账单记录' AS result FROM t_bill;
