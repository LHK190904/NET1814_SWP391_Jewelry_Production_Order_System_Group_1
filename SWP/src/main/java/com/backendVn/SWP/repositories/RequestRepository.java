package com.backendVn.SWP.repositories;

import com.backendVn.SWP.entities.Request;
import com.backendVn.SWP.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface RequestRepository extends JpaRepository<Request, Integer> {
    List<Request> findAllByCustomerID(User customer);

    List<Request> findAllBySaleStaffIDNull();

    List<Request> findAllBySaleStaffID(User user);
}