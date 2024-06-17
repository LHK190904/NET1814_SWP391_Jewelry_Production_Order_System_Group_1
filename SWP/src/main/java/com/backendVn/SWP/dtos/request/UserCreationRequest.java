package com.backendVn.SWP.dtos.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;

/**
 * DTO for {@link com.backendVn.SWP.entities.User}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest implements Serializable {
    @Size(min = 3,message = "INVALID_USERNAME")
    String userName;

    @Size(min = 8, message = "INVALID_PASSWORD")
    String password;

    @Email(message = "INVALID_EMAIL")
    String email;

    String address;

    @Pattern(regexp = "ADMIN|PRODUCTIONSTAFF|DESIGNSTAFF|SALESTAFF|CUSTOMER|MANAGER", message = "INVALID_TITLE")
    String title;
}