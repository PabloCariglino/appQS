package com.QS.AppQuickSolutions.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.QS.AppQuickSolutions.entity.User;
import com.QS.AppQuickSolutions.enums.Role;

@Repository
public interface UserRepository extends JpaRepository<User , Long> {
    
   // Buscar usuario por email
   Optional<User> findByEmail(String email);

   // Buscar usuarios por rol
   List<User> findByRole(Role role);

   // Comprobar si un email ya está registrado
   boolean existsByEmail(String email);

   //buscar por email de usuario
   //@Query("SELECT u FROM Usuario u WHERE u.email = :email")
   //public Usuario buscarPorEmail(@Param("email") String email);

   //buscar por id de usuario
   //@Query("SELECT u FROM Users u WHERE u.email = :email")
   //public User findById(@Param("UserID") Long UserID);
}
