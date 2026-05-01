import React, { useState } from 'react';
import axios from 'axios';
import './companyRegister.css';

const CompanyRegister = () => {

  const [form, setForm] = useState({
    companyName: '',
    branch: '',
    email: '',
    mobileNo: '',
    hasArrears: false,
    highestPackage: '',
    profilePic: null
  });

  const [errors, setErrors] = useState({});

  
  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;

    if (type === "file") {
      setForm({ ...form, [name]: files[0] });
    } else if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };


  const validate = () => {
    const newErrors = {};

    if (!form.companyName.trim()) newErrors.companyName = "Company name required";
    if (!form.branch.trim()) newErrors.branch = "Branch required";
    if (!form.email.includes("@")) newErrors.email = "Valid email required";
    if (!form.mobileNo || form.mobileNo.length !== 10) newErrors.mobileNo = "Valid mobile number required";
    if (!form.highestPackage) newErrors.highestPackage = "Package required";
    if (!form.profilePic) newErrors.profilePic = "Profile picture required";

    return newErrors;
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length !== 0) return;

    const companyObject = {
      companyName: form.companyName,
      branch: form.branch,
      email: form.email,
      mobileNo: form.mobileNo,
      hasArrears: form.hasArrears,
      highestPackage: parseFloat(form.highestPackage)
    };

    const formData = new FormData();

    
    formData.append("company", JSON.stringify(companyObject));
    formData.append("profilePic", form.profilePic);

    try {
      await axios.post("http://localhost:8080/register", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Company Registered Successfully!");
      
    } catch (error) {
      console.error("Error:", error);
      alert("Registration failed");
    }
  };

  return (
    <div className="register-container">
      <center><h2>Company Registration</h2></center>  

      <form onSubmit={handleSubmit} className="register-form">

        <input
          type="text"
          name="companyName"
          placeholder="Company Name"
          value={form.companyName}
          onChange={handleChange}
        />
        {errors.companyName && <p className="error">{errors.companyName}</p>}

        <input
          type="text"
          name="branch"
          placeholder="Branch"
          value={form.branch}
          onChange={handleChange}
        />
        {errors.branch && <p className="error">{errors.branch}</p>}

        <input
          type="text"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <input
          type="text"
          name="mobileNo"
          placeholder="Mobile Number"
          value={form.mobileNo}
          onChange={handleChange}
        />
        {errors.mobileNo && <p className="error">{errors.mobileNo}</p>}

        <input
          type="number"
          name="highestPackage"
          placeholder="Highest Package (LPA)"
          value={form.highestPackage}
          onChange={handleChange}
        />
        {errors.highestPackage && <p className="error">{errors.highestPackage}</p>}

       
        <label>
          <input
            type="checkbox"
            name="hasArrears"
            checked={form.hasArrears}
            onChange={handleChange}
          />
          Allows students with arrears
        </label>

        <label>Upload Company Logo:</label>
        <input
          type="file"
          name="profilePic"
          accept="image/jpeg"
          onChange={handleChange}
        />
        {errors.profilePic && <p className="error">{errors.profilePic}</p>}

        <button type="submit">Register Company</button>

      </form>
    </div>
  );
};

export default CompanyRegister;