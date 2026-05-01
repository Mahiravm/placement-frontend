import React, { useEffect, useState } from "react";
import axios from "axios";
import "./companyDashboard.css";

function CompanyDashboard() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8080/getCompany")
      .then(res => {
        setCompanies(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="container"><p>Loading companies...</p></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Our Recruiters</h1>
        <input type="text" className="search-box" placeholder="Search........" />
      </div>

      <div className="grid">
        {companies.map(company => (
          <div className="card" key={company.companyId}>
            <div className="card-header">
              <div className="logo-section">
                <img
                  src={`http://localhost:8080/uploads/${company.logoPicPath}`}
                  alt={company.companyName}
                  className="company-logo"
                />
              </div>
              <span className="category-tag">IT</span>
            </div>

            <h3 className="company-name">{company.companyName}</h3>

            <div className="key-info">
              <div className="info-label">Key Info</div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-title">CTC</span>
                  <span className="info-value">{company.lastHighestPackage} LPA</span>
                </div>
                <div className="info-item">
                  <span className="info-title">Location</span>
                  <span className="info-value">{company.branch}</span>
                </div>
                <div className="info-item">
                  <span className="info-title">Branch</span>
                  <span className="info-value">ALL Branches</span>
                </div>
              </div>
            </div>

            <button className="view-btn">View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompanyDashboard;