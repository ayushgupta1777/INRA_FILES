import React, { useEffect, useState, useRef } from 'react';

import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../../style/loans/loan-profile.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faCircleUser, faArrowLeft, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ThreeDot } from 'react-loading-indicators';
import Message from '../global/alert';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Loan_detail_loading from "../global/Loading/loan-profile-loading"
import '../../style/loans/delete-modal.css'; // Improved Delete Modal Styles

const LoanProfile = () => {
  const [loanDetails, setLoanDetails] = useState(null);
  const [profile, setProfile] = useState(null);
  // const { compoundInterest = { enabled: false, frequency: null } } = loanDetails;
  const [showReceipt, setShowReceipt] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [amount1, setAmount1] = useState('');
  const [method, setMethod] = useState('Cash');
  const [topupinterestrate, settopupinterestrate] = useState('');
  const [amount2, setAmount2] = useState("");
  const [date, setDate] = useState("");

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [bgColor, setBgColor] = useState("");

  const menuRef = useRef(null);


  const [progress, setProgress] = useState(60);

  const [loanData, setLoanData] = useState({
    totalLoan: 0,
    totalInterest: 0,
    netTopUp: 0,
    totalAmount: 0,
    lastUpdated: '02/05/2025'
  });

  const [percentages, setPercentages] = useState({
    loanPercentage: 16.1,
    interestPercentage: 16.1,
    topUpPercentage: -8.8
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { customerID } = useParams();

  const [savedRemark, setSavedRemark] = useState("");
  const [note, setNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [isModalOpen3, setIsModalOpen3] = useState(false); // For interest payment
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // For delete confirmation
  const [amount3, setAmount3] = useState(''); // Interest payment amount
  const [errorMessage, setErrorMessage] = useState('');

  const handleDeleteProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`https://aero31.vercel.app/api/delete-customer-profile/${customerID}`, {
        headers: { 'x-auth-token': token }
      });

      setMessage({ type: 'success', text: 'Profile deleted successfully' });
      setIsDeleteModalOpen(false);

      // Navigate back to home or transaction list after small delay
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } catch (error) {
      console.error('Error deleting profile:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error deleting profile' });
      setLoading(false);
    }
  };



  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);

    // Clear the timeout when the component unmounts or when message changes
    return () => clearTimeout(timer);
  }, [message]);




  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add this function inside your component before the return statement:
  const createRipple = (event) => {
    const button = event.currentTarget;

    // Remove any existing ripple elements
    const ripple = button.querySelector('.ripple');
    if (ripple) {
      ripple.remove();
    }

    // Create new ripple element
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    // Set ripple positioning based on click location
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add('ripple');

    // Add to button and auto-remove after animation
    button.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  };

  // Add this smoothModal close function
  const handleSmoothModalClose = () => {
    const modal = document.querySelector('.topup-container');

    if (modal) {
      modal.style.transform = 'translateY(100%)';
      setTimeout(() => {
        setIsModalOpen(false); // or setIsModalOpen2(false) depending on which modal you're closing
      }, 400); // Match this to your animation duration
    } else {
      setIsModalOpen(false); // Fallback if element not found
    }
  };

  // Replace modal close handlers with this:
  const handleCloseModal = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      handleSmoothModalClose();
      setTimeout(() => {
        setIsModalOpen(false);
      }, 300);
    }
  };

  const handleCloseModal2 = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      handleSmoothModalClose();
      setTimeout(() => {
        setIsModalOpen2(false);
      }, 300);
    }
  };

  // Progress bar animation enhancement - add to your useEffect or initialization
  useEffect(() => {
    // Your existing code...

    // Progressive counter animation for card values
    const animateValue = (obj, start, end, duration) => {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        obj.innerHTML = `₹ ${formatToIndianCurrency(value)}`;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    };

    // Apply to card values when they come into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const valueElement = entry.target;
          const finalValue = parseInt(valueElement.getAttribute('data-value') || '0', 10);
          animateValue(valueElement, 0, finalValue, 1500); // 1.5 second animation
          observer.unobserve(valueElement); // Only animate once
        }
      });
    }, { threshold: 0.5 });

    // Observe all card values
    // document.querySelectorAll('.dashboard-card.card-white .card-amount .value, .card-purple .value').forEach(value => {
    //   // Store the actual value as a data attribute
    //   const actualValue = value.innerHTML.replace('₹ ', '').replace(',', '');
    //   value.setAttribute('data-value', actualValue);
    //   observer.observe(value);
    // });
  }, [loanDetails]);


  useEffect(() => {
    const fetchLoanDetails = async () => {
      setBgColor(generateRandomColor());

      try {
        const token = localStorage.getItem('token');

        const { data } = await axios.get(`https://aero31.vercel.app/api/loan-profile/${customerID}`, {
          headers: { 'x-auth-token': token }
        });
        setLoanDetails(data);
        setMessage({ type: 'success', text: 'Successful get Customer DATA' });

        setLoading(false);
      } catch (err) {
        setError('Error fetching loan details. Please try again.');
        setLoading(false);
        setMessage({ type: 'error', text: 'Unauthorized: You do not have access to this loan' });

      }
    };

    fetchLoanDetails();
  }, [customerID]);

  useEffect(() => {
    const fetchLoanDetails1 = async () => {
      try {
        const token = localStorage.getItem('token');

        const { data } = await axios.get(`https://aero31.vercel.app/api/loan-profile2/${customerID}`, {
          headers: { 'x-auth-token': token }
        });
        setProfile(data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching loan details. 85678 Please try again.');
        setLoading(false);
        setMessage({ type: 'error', text: 'Unauthorized: You do not have access to this loan' });

      }
    };

    fetchLoanDetails1();
  }, [customerID]);


  const handleUpdateBillNumber = async () => {
    const newBillNumber = prompt('Enter new bill number:'); // Simple input method  
    if (newBillNumber) {
      try {
        // Assuming there's an API endpoint to update the loan bill number  
        const response = await axios.put(`https://aero31.vercel.app/api/billNo/${customerID}`, {
          billNumber: newBillNumber // Include other necessary data based on your requirements  
        });

        // Update the state with the new loan details  
        setLoanDetails(response.data);
        alert('Bill number updated successfully!');
      } catch (error) {
        console.error('Error updating bill number:', error);
        alert('Failed to update bill number. Please try again.');
      }
    }
  };

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`https://aero31.vercel.app/api/loan-profile/${customerID}`, {
          headers: { 'x-auth-token': token }
        });
        setLoanDetails(data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching loan details.');
        setLoading(false);
      }
    };

    const updateInterest = async () => {
      try {
        await axios.put(`https://aero31.vercel.app/api/update-interest/${customerID}`);
      } catch (err) {
        console.error('Error updating interest:', err);
      }
    };

    // Fetch initial details and update interest periodically
    fetchLoanDetails();
    const interval = setInterval(() => {
      updateInterest();
      fetchLoanDetails();
    }, 6000); // Update every second
    // }, 6000); // Update every second
    // }, 600000);
    return () => clearInterval(interval); // Cleanup on component unmount
  }, [customerID]);

  // Handle Top-Up
  const handleTopUp = async () => {
    const topUpAmount = prompt('Enter the top-up amount:'); // Ask user for the amount
    if (!topUpAmount || isNaN(topUpAmount) || topUpAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    try {
      const { data } = await axios.put(`https://aero31.vercel.app/api/top-up/${customerID}`, {
        topUpAmount: parseFloat(topUpAmount),
      });

      // Update state with new loan details
      setLoanDetails(data);
      alert('Top-up successful!');
    } catch (err) {
      console.error('Error during top-up:', err);
      alert('Failed to process the top-up. Please try again.');
    }
  };

  const handleTopUp1 = async () => {
    if (!amount1 || amount1 <= 0 || !date || !topupinterestrate) {
      setMessage('Enter a valid amount.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.put(`https://aero31.vercel.app/api/loans/${customerID}/topup`, {
        amount: parseFloat(amount1),
        date,
        method,
        topupinterestrate,
      });

      setMessage(response.data.message);
      // onSuccess(); // Refresh parent data

      setAmount1('');
      setDate("");
      settopupinterestrate('');
      setIsModalOpen(false)

    } catch (error) {
      setMessage(error.response?.data?.message || 'Error processing top-up');
    } finally {
      setLoading(false);
    }
  };

  const handleRepayment = async () => {
    if (!amount2 || !date) {
      setError("Please enter amount and date.");
      return;
    }

    // setLoading(true);
    try {
      const response = await axios.put(
        `https://aero31.vercel.app/api/top-down/${customerID}`,
        { amount: parseFloat(amount2), date, method }
      );
      setMessage({ type: 'success', text: response.data.message });

      // Refresh loan details
      const { data } = await axios.get(`https://aero31.vercel.app/api/loan-profile/${customerID}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setLoanDetails(data);

      setAmount2("");
      setDate("");
      setIsModalOpen2(false);
      settopupinterestrate('');
      // setError("");
    } catch (err) {
      console.error("Error processing repayment:", err);
      setError("Failed to process repayment. Try again.");
      setMessage({ type: 'error', text: errorMessage });

    }
    setLoading(false);
  };

  // Add handler for interest payment
  const handleInterestPayment = async () => {
    if (!amount3 || amount3 <= 0 || !date) {
      setMessage({ type: 'error', text: 'Please enter a valid amount and date.' });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        `https://aero31.vercel.app/api/top-down-interest/${customerID}`,
        {
          amount: parseFloat(amount3),
          date,
          method
        }
      );

      setMessage({ type: 'success', text: response.data.message });

      // Refresh loan details
      const { data } = await axios.get(`https://aero31.vercel.app/api/loan-profile/${customerID}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setLoanDetails(data);

      setAmount3('');
      setDate('');
      setIsModalOpen3(false);
    } catch (error) {
      console.error('Error processing interest payment:', error);
      const errorMessage = error.response?.data?.error || 'Failed to process interest payment. Try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };


  // Add close handler for the new modal
  const handleCloseModal3 = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      handleSmoothModalClose();
      setTimeout(() => {
        setIsModalOpen3(false);
      }, 300);
    }
  };
  //   const calculateDailyInterest = (amount, interestRate) => {
  //     const dailyRate = (interestRate / 100) / 30; // Assuming 30 days in a month
  //     return dailyRate * amount; // Daily interest for the amount
  //   };

  //   const calculateAccruedInterest = (amount, interestRate, startDate) => {
  //     const today = new Date();
  //     const start = new Date(startDate);
  //     const elapsedDays = Math.floor((today - start) / (1000 * 60 * 60 * 24)); // Convert ms to days
  //     const dailyInterest = calculateDailyInterest(amount, interestRate);
  //     return dailyInterest * elapsedDays; // Total accrued interest
  //   };

  //   // Calculate accrued interest dynamically
  //   let accruedInterest = 0;
  //   let totalAmount = 0;

  //   if (loanDetails) {
  //     const { amount, interestRate, startDate } = loanDetails.loanDetails;
  //     accruedInterest = calculateAccruedInterest(amount, interestRate, startDate);
  //     totalAmount = amount + accruedInterest; // Total amount = principal + accrued interest
  //   } 

  //   let totalLeft = 0;

  // if (loanDetails) {
  //   const { amount, interestRate, startDate } = loanDetails.loanDetails;
  //   accruedInterest = calculateAccruedInterest(amount, interestRate, startDate);
  //   totalAmount = amount + accruedInterest;
  //   totalLeft = totalAmount - amount; // Calculate the remaining amount (if applicable)
  // }


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file)); // Show preview before upload
      uploadImage(file); // Upload image to Cloudinary
    }
  };

  const uploadImage = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(`https://aero31.vercel.app/api/images/upload/${customerID}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImage(response.data.imageUrl); // Store the uploaded image URL
      console.log(response)
    } catch (error) {
      console.error("Error uploading image", error);
    } finally {
      setLoading(false);
    }
  };


  // Fetch existing note from database
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await axios.get(`https://aero31.vercel.app/api/${customerID}/remark`);
        setNote(response.data.remark || "Write your note here...");
      } catch (error) {
        console.error("Error fetching note:", error);
      }
    };

    fetchNote();
  }, [customerID]);

  // Update note in the database
  const handleSave = async () => {
    try {
      await axios.put(`https://aero31.vercel.app/api/${customerID}/remark`, { remarks: note });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };


  const generateRandomColor = () => {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#FFBB33", "#8E44AD", "#2E86C1"];
    return colors[Math.floor(Math.random() * colors.length)];
  };


  const handleAddSignature = () => {
    navigate(`/add-signature/${customerID}`);
  };
  const handlehome = () => {
    navigate(`/home`);
  };

  const DetailPage = () => {
    navigate(`/top-t/${customerID}`);
  };



  // Format to Indian Number System
  const formatToIndianCurrency = (number) => {
    if (number === null || number === undefined) return '';

    const numStr = number.toString(); // Convert to string

    // Split into integer and decimal parts
    const [integerPart, decimalPart] = numStr.split('.');

    // Format integer part to Indian Number System
    const formattedInteger = integerPart.replace(
      /(\d)(?=(\d\d)+\d$)/g, // Regex for Indian Number System grouping
      '$1,'
    );

    // Combine integer and decimal parts
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };


  // const [active, setActive] = useState(""); // State to track active menu item

  // const handleItemClick = (item) => {
  //   setActive(item);
  // };

  const handleClick = () => {
    setProgress(100); // Start filling the progress arc
    setTimeout(() => {
      navigate(`/DetailPage/${customerID}`); // Redirect after 3 seconds
    }, 1000);
  };


  if (loading) {
    return (
      <Loan_detail_loading />

    )
  }

  // <div 
  // className="container" 
  // style={{
  //   display: "flex",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   height: "100vh", // Full height of the viewport (optional)
  //   width: "100%", // Full width of the container
  //   background: "transparent", // Explicitly set transparent background

  // }}
  // >
  // <ThreeDot color="#3168cc" size="medium" text="" textColor="" />
  // </div>;

  if (error) {
    return (
      <Loan_detail_loading />

    )
  }


  // <div 
  // className="container" 
  // style={{
  //   display: "flex",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   height: "100vh", // Full height of the viewport (optional)
  //   width: "100%", // Full width of the container
  //   background: "transparent", // Explicitly set transparent background

  // }}
  // >
  // <ThreeDot color="#3168cc" size="medium" text="Error" textColor="" />
  // </div>;


  // const handleReceipt = () => {
  //   navigate(`/receipt/${customerID}`, { state: { profile, loanDetails } });
  // };

  const handleReceipt = () => {
    navigate(`/Loc_AI/${customerID}`);
  };



  const { loanType, amount, interestRate, startDate, compoundInterest, interestFrequency, remarks, billNo, remainingPrincipal, topUpTotal } = loanDetails?.loanDetails || {};
  const { accruedInterest, totalAmount, topdownInterest } = loanDetails?.loanDetails || {};
  const { updatedAt, createdAt, profileImage } = loanDetails || {};

  const { FirstName, LastName } = profile || {};

  // const topUpTotal = loanDetails?.loanDetails.topUpHistory?.reduce((sum, topUp) => sum + topUp.amount, 0) || 0;

  const totalLoanAmount = amount + topUpTotal;


  const topUpInterest = loanDetails?.loanDetails?.topUpInterest || 0;

  const totalInterest = accruedInterest + topUpInterest;
  // const totalInterest = accruedInterest 
  const P = topUpTotal + totalAmount

  const topup = topUpInterest + topUpTotal;

  // const grandTotal = topup + totalAmount; 

  const grandTotal = P + totalInterest

  const data = [
    { title: "Total Income", value: "4.719,00", percentage: "16.1%", change: "vs previous month", className: "card" },
    { title: "Total Expenses", value: "3.270,00", percentage: "16.1%", change: "vs previous month", className: "card purple" },
    { title: "Net Profit", value: "629,00", percentage: "-8.8%", change: "vs previous month", className: "card" },
    { title: "Cash at end of month", value: "7.684,00", percentage: "4.9%", change: "vs previous month", className: "card" },
  ];

  const percentage = 10;
  const barPercentage = 8;


  return (
    <div className="loan-profile">
      {/* Header Section */}
      <div className="header">
        <span onClick={() => handlehome()}><FontAwesomeIcon icon={faArrowLeft} size="lg" /></span>
        <div className="customer-info">
          {/* <span className='pic'><FontAwesomeIcon icon={faCircleUser} size="2xl" /></span> */}

          <div className="loan-profile-container-lp">
            <label htmlFor="fileInput" className="image-upload">
              {profileImage ? (
                <img src={profileImage} alt="Profile" width={150} height={150} style={{ borderRadius: "50%" }} className="loan-profile-image-lp"
                  onContextMenu={(e) => e.preventDefault()} // Disable right-click
                  draggable="false"
                />
              ) : (
                <div className="profile-placeholder-lp" style={{ backgroundColor: bgColor }}>
                  {FirstName ? FirstName.charAt(0).toUpperCase() : "?"}
                </div>
              )}
            </label>
            <input id="fileInput" type="file" accept="image/*" onChange={handleImageChange} hidden />
            {loading && <p>Uploading...</p>}
          </div>

          <h2>{FirstName}</h2>
        </div>
        {/* <div className="customer-info" onClick={handleUpdateBillNumber}>
          <p>Bill #: {billNo}</p>
          <span  className="update-btn"><FontAwesomeIcon icon={faPencil} /></span>  
        </div> */}


        {/* <button className="receipt-btn" onClick={handleReceipt}> Receipt </button>       */}
        <div className="header-actions">
          <button className="receipt-btn whatsapp-btn" onClick={() => navigate(`/whatsapp-statement/${customerID}`)}>
            {/* <FontAwesomeIcon icon={faWhatsapp} />  */}
            WhatsApp
          </button>
          <button className="receipt-btn delete-btn" style={{ backgroundColor: '#ff4d4d', color: 'white', marginLeft: '10px' }} onClick={() => setIsDeleteModalOpen(true)}>
            <FontAwesomeIcon icon={faTrash} /> Delete
          </button>
          {/* <button className="receipt-btn invoice-btn" onClick={() => navigate(`/printable-invoice/${customerID}`)}>
    <FontAwesomeIcon icon={faPrint} /> Invoice
  </button> */}
        </div>

      </div>


      <div className="loan-dashboard-container">
        <div className="dashboard-grid">
          <div className="dashboard-card card-white">
            <div className="card-content">
              <h2 className="card-title">Total Loan</h2>
              <p className="card-amount">₹ <span className="value">{formatToIndianCurrency(Math.floor(totalLoanAmount || 0))}</span></p>
              <div className="card-percentage positive">
                {new Date(createdAt).toLocaleString()}
              </div>
              <p className="card-comparison">           </p>
            </div>
          </div>

          <div className="dashboard-card card-purple2">
            <div className="card-content">
              <h2 className="card-title">Total Interest</h2>
              <p className="card-amount">₹ <span className="value">{formatToIndianCurrency(Math.floor(totalInterest || 0))}</span></p>
              <div className="card-percentage positive">
                {/* {percentages.interestPercentage}% */}
              </div>
              <p className="card-comparison">                   </p>
            </div>
          </div>

          <div className="dashboard-card card-white" onClick={DetailPage} style={{ cursor: 'pointer' }}>
            <div className="card-content">
              <h2 className="card-title">Net Top-up</h2>
              <p className="card-amount">₹ <span className="value">{formatToIndianCurrency(Math.floor(topUpTotal || 0))}</span></p>
              <div className="card-percentage negative">
                {/* {percentages.topUpPercentage}% */}
              </div>
              <p className="card-comparison">                 </p>
            </div>
          </div>

          <div className="dashboard-card card-white" onClick={handleClick} style={{ cursor: 'pointer' }}>
            <div className="card-content">
              <h2 className="card-title">Total Amount</h2>
              <p className="card-amount">₹ <span className="value">{formatToIndianCurrency(Math.floor(grandTotal))}</span></p>
              <div className="card-date">
                {new Date(updatedAt).toLocaleString()}
              </div>
              <p className="card-update-text">                </p>
            </div>
          </div>
        </div>
      </div>

      {/* <div className='jkl'> */}

      {/*   <div className="container-LPU">
        <div className="card">
          <h2>Total Loan</h2>
          <p className="value">₹ {Math.floor(totalLoanAmount || 0)}</p>
          <p className="percentage">16.1%</p>
          <p className="change">vs previous month</p>
        </div>
        <div className="card-purple">
          <h2>Total Interest</h2>
          <p className="value">₹ {formatToIndianCurrency(Math.floor(accruedInterest || 0))}</p>
          <p className="percentage">16.1%</p>
          <p className="change">vs previous month</p>
        </div>
        <div className="card">
          <h2>Net Top-up</h2>
          <p className="value">₹ {topUpTotal}</p>
          <p className="percentage">-8.8%</p>
          <p className="change">vs previous month</p>
        </div>
        <div className="card">
          <h2>Total Amount</h2>
          <p className="value">₹ {formatToIndianCurrency(Math.floor(totalAmount))}</p>
          <p className="percentage">{new Date(updatedAt).toLocaleDateString('en-GB')}</p>
          <p className="change">last updated</p>
        </div>
      </div>

 */}
      <button className="read-more-btn-lp" onClick={DetailPage}>
        <span className="text" >Transaction History</span>
        <span className="icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 6L15 12L9 18"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="circular-animation"></div>
      </button>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay-custom">
          <div className="delete-modal-content">
            <div className="delete-icon-wrapper">
              <FontAwesomeIcon icon={faTrash} shake />
            </div>
            <h3 className="delete-modal-title">Delete Profile?</h3>
            <p className="delete-modal-text">
              Are you sure you want to delete this profile?
              <br />
              <span style={{ fontSize: '0.9rem', color: '#ef4444' }}>All associated loan data will be permanently removed.</span>
            </p>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-delete"
                onClick={handleDeleteProfile}
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}


      {/* </div> */}




      {/* inerest circular  */}

      <div className="progress-container">
        <div className="centered-container">
          <div className="unique-circular-container" onClick={handleClick}>
            <svg className="unique-circular-svg" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>

              <circle className="unique-circle-bg" cx="50" cy="50" r="45" />
              <circle
                className="unique-circle-progress"
                cx="50"
                cy="50"
                r="45"
                style={{ strokeDashoffset: 283 - (progress / 100) * 283 }}
              />
            </svg>
            <span className="unique-button-text">Read More</span>
          </div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-label">{interestRate}%</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${interestRate}%` }}
            ></div>
          </div>
          <div className="progress-label">Interest Rate</div>
        </div>
        {/* <div className="customer-info" onClick={handleUpdateBillNumber}>
                <p>Bill #: {billNo}</p>
                <span  className="update-btn"><FontAwesomeIcon icon={faPencil} /></span>  
              </div> */}
      </div>

      {/* <div className="centered-container">
      <div className="unique-circular-container" onClick={handleClick}>
        <svg className="unique-circular-svg" viewBox="0 0 100 100">
        <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          <circle className="unique-circle-bg" cx="50" cy="50" r="45" />
          <circle
            className="unique-circle-progress"
            cx="50"
            cy="50"
            r="45"
            style={{ strokeDashoffset: 283 - (progress / 100) * 283 }}
          />
        </svg>
        <span className="unique-button-text">Read More</span>
      </div>
    </div> */}

      <div className="note-container">
        {isEditing ? (
          <textarea
            className="note-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleSave} // Save on blur
            onKeyDown={(e) => e.key === "Enter" && handleSave()} // Save on Enter key
            autoFocus
          />
        ) : (
          <div className="note-display">
            <p>{note}</p>
            <FontAwesomeIcon icon={faPen} className="edit-icon" onClick={() => setIsEditing(true)} />
          </div>
        )}
      </div>




      {/* footer */}

      <footer className="footer">
        <div className="footer-container">


          {/* Left Side - Adjusted Content */}
          {/* <div className="footer-left">
          <p>Creative solutions</p>
          <p>for growth.</p>
          <p>Innovative designs</p>
          <p>every day.</p>
          <p>We build brands</p>
          <p>with care.</p>
        </div> */}

          {/* Center Section - Logo & Navigation */}
          <div className="footer-center">
            <h2 className="footer-logo">
              <span className="footer-icon">📌</span> CZONE
            </h2>
            <ul className="footer-nav">
              <li><a href="#">Home</a></li>
              <li><a href="#">About</a></li>
              <li><a href="#">Service</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>

            {/* Social Icons */}
            <div className="footer-social">
              <span className="social-icon" onClick={() => navigate(`/add-signature/${customerID}`)} >ADD SIGNATURE</span>
              <span className="social-icon" onClick={() => navigate(`/top-t/${customerID}`)}>Transaction History</span>
              {/* <span className="social-icon">Ig</span>
            <span className="social-icon">Tw</span> */}
            </div>
          </div>
        </div>
        {/* Horizontal Line & Copyright */}
        <div className="footer-divider"></div>
        <p className="footer-copyright">Copyright CZONE</p>

      </footer>



      <div className="dropdown-container" ref={menuRef}>
        <button
          className={`dropdown-btn ${isOpen ? "active" : ""}`}
          onClick={(e) => {
            createRipple(e);
            setIsOpen(!isOpen);
          }}
        >
          Options <span className={`arrow ${isOpen ? "rotate" : ""}`}>▼</span>
        </button>

        <div className={`dropdown-menu ${isOpen ? "show" : ""}`}>
          <div
            className="dropdown-item"
            onClick={(e) => {
              setIsModalOpen(true);
              setIsOpen(false);
            }}
          >
            <span className="icon">⬆️</span> TOP-UP (Add Loan)
          </div>
          <div
            className="dropdown-item"
            onClick={() => {
              setIsModalOpen2(true);
              setIsOpen(false);
            }}
          >
            <span className="icon">💵</span> PAY PRINCIPAL
          </div>
          <div
            className="dropdown-item"
            onClick={() => {
              setIsModalOpen3(true);
              setIsOpen(false);
            }}
          >
            <span className="icon">💰</span> PAY INTEREST
          </div>

        </div>
      </div>

      {
        isModalOpen && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="topup-container">
              <button
                className="close-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSmoothModalClose();
                  setTimeout(() => setIsModalOpen(false), 300);
                }}
              >
                ✖
              </button>

              <h2 className="topup-title">Top-Up Loan</h2>

              <div className="topup-box">
                <label className="topup-label">Offer Your Amount</label>
                <input
                  type="number"
                  value={amount1}
                  onChange={(e) => setAmount1(Math.max(0, e.target.value))}
                  className="topup-input"
                  placeholder="₹ 150"
                  min="0"
                />
                <input
                  type="number"
                  value={topupinterestrate}
                  onChange={(e) => settopupinterestrate(Math.max(0, e.target.value))}
                  className="topup-input"
                  placeholder="5%"
                  min="0"
                />
                <button
                  onClick={(e) => {
                    createRipple(e);
                    handleTopUp1();
                  }}
                  className="topup-button ripple-effect"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Apply"}
                </button>

                <div className="input-group">
                  <label className="topup-label">Date:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="date-input"
                  />
                </div>
              </div>

              <label className="topup-label">Payment Method:</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="topup-select"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>
          </div>
        )
      }

      {
        isModalOpen2 && (
          <div className="modal-overlay" onClick={handleCloseModal2}>
            <div className="topup-container">
              <button className="close-button" onClick={() => setIsModalOpen2(false)}>✖</button>


              <h2 className="topup-title">Pay Principal Amount</h2>

              <div className="topup-box">
                <label className="topup-label">Payment Amount</label>
                <input
                  type="number"
                  value={amount2}
                  onChange={(e) => setAmount2(Math.max(0, e.target.value))}
                  className="topup-input"
                  placeholder="₹ 150"
                  min="0"
                />
                <button onClick={handleRepayment} className="topup-button" disabled={loading}>
                  {loading ? "Processing..." : "Pay Principal"}
                </button>

                <div className="input-group">
                  <label className="topup-label">Date:</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>

              </div>



              <label className="topup-label">Payment Method:</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className="topup-select">
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>
          </div>
        )
      }


      {
        isModalOpen3 && (
          <div className="modal-overlay" onClick={handleCloseModal3}>
            <div className="topup-container">
              <button
                className="close-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSmoothModalClose();
                  setTimeout(() => setIsModalOpen3(false), 300);
                }}
              >
                ✖
              </button>

              <h2 className="topup-title">Pay Interest</h2>

              <div className="topup-box">
                <label className="topup-label">Interest Payment Amount</label>
                <p className="info-text">
                  Available Interest: ₹{formatToIndianCurrency(Math.floor(totalInterest || 0))}
                </p>
                <input
                  type="number"
                  value={amount3}
                  onChange={(e) => setAmount3(Math.max(0, e.target.value))}
                  className="topup-input"
                  placeholder="₹ 150"
                  min="0"
                  max={totalInterest}
                />
                <button
                  onClick={(e) => {
                    createRipple(e);
                    handleInterestPayment();
                  }}
                  className="topup-button ripple-effect"
                  disabled={loading || !totalInterest || totalInterest <= 0}
                >
                  {loading ? "Processing..." : "Pay Interest"}
                </button>

                <div className="input-group">
                  <label className="topup-label">Date:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="date-input"
                  />
                </div>
              </div>

              <label className="topup-label">Payment Method:</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="topup-select"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
              </select>

              {!totalInterest || totalInterest <= 0 ? (
                <p className="warning-text" style={{ color: 'red', marginTop: '10px' }}>
                  ⚠️ No interest available to pay
                </p>
              ) : null}
            </div>
          </div>
        )
      }

      {/* <button 
  className="read-more-btn-lp ripple-effect" 
  onClick={(e) => {
    createRipple(e);
    DetailPage();
  }}
>
  <span className="text">READ MORE</span>
  <span className="icon">
    <svg 
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 6L15 12L9 18"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
  <div className="circular-animation"></div>
</button>

<div className="card">
  <h2>Total Loan</h2>
  <p className="value" data-value={Math.floor(totalLoanAmount || 0)}>
    ₹ {formatToIndianCurrency(Math.floor(totalLoanAmount || 0))}
  </p>
  <p className="percentage">16.1%</p>
  <p className="change">vs previous month</p>
</div>

<div className="unique-circular-container" onClick={(e) => {
  createRipple(e);
  handleClick();
}}>
  <svg className="unique-circular-svg" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>

    <circle className="unique-circle-bg" cx="50" cy="50" r="45" />
    <circle
      className="unique-circle-progress"
      cx="50"
      cy="50"
      r="45"
      style={{ strokeDashoffset: 283 - (progress / 100) * 283 }}
    />
  </svg>
  <span className="unique-button-text">Read More</span>
</div>

<div className="note-container">
  {isEditing ? (
    <textarea
      className="note-input"
      value={note}
      onChange={(e) => setNote(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => e.key === "Enter" && handleSave()}
      autoFocus
    />
  ) : (
    <div className="note-display">
      <p>{note}</p>
      <FontAwesomeIcon 
        icon={faPen} 
        className="edit-icon" 
        onClick={() => setIsEditing(true)} 
      />
    </div>
  )}
</div>

<div className="footer-social">
  <span 
    className="social-icon ripple-effect" 
    onClick={(e) => {
      createRipple(e);
      navigate(`/add-signature/${customerID}`);
    }}
  >
    ADD SIGNATURE
  </span>
  <span 
    className="social-icon ripple-effect" 
    onClick={(e) => {
      createRipple(e);
      navigate(`/top-t/${customerID}`);
    }}
  >
    TOP
  </span>
  <span className="social-icon ripple-effect">Ig</span>
  <span className="social-icon ripple-effect">Tw</span>
</div> */}
      {/* </div> */}
      <Message type={message.type} text={message.text} />

    </div >
  );
};

export default LoanProfile;
