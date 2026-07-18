package com.jizhang.repository;

import com.jizhang.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {

    /** 按日期范围查询 */
    List<Bill> findByDateBetween(LocalDate start, LocalDate end);

    /** 按日期降序排列（最新的在前） */
    List<Bill> findByDateBetweenOrderByDateDescCreateTimeDesc(LocalDate start, LocalDate end);
}
