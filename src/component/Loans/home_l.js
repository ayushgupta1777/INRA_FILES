import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Message from '../global/alert';
import { ThreeDot } from 'react-loading-indicators';
import '../../style/loans/home-page.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faGift,
  faExchangeAlt,
  faStar,
  faWallet,
  faBell,
  faChartLine,
  faHome,
  faMoneyBillWave,
  faUsers,
  faPlus,
  faHandHoldingUsd,
  faArrowDown,
  faSignOutAlt,
  faArrowRightFromBracket,
  faArrowUp,
  faChevronRight,
  faInfoCircle,
  faLock,
  faQuestion,
  faGlobe,
  faFileAlt,
  faTicketAlt,
  faPlay,
  faAngleDown,
  faCog,
  faAddressBook,
  faClipboardList,
  faUserCog,


} from "@fortawesome/free-solid-svg-icons";
import LoadSKL from "../../component/global/Loading/Home_i"

// Rest of the code remains the same...
// const formatToIndianCurrency = (number) => {
//   if (number === null || number === undefined) return '';
  
//   const absNumber = Math.abs(number); // Handle negative numbers
//   if (absNumber >= 1e7) {
//     // Convert to crores
//     return `${(number / 1e7).toFixed(2)} Cr`;
//   } else if (absNumber >= 1e5) {
//     // Convert to lakhs
//     return `${(number / 1e5).toFixed(2)} L`;
//   } else {
//     // Show in rupees with commas
//     const [integerPart, decimalPart] = number.toString().split('.');
//     const formattedInteger = integerPart.replace(/\B(?=(\d{2})+(?!\d))/g, ',').replace(/(\d+)(?=(\d{3},))/g, '$1,');
//     return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
//   }
// };

const HomePage = ({ customerID }) => {
  const navigate = useNavigate();
  const [balanceData, setBalanceData] = useState({
    peopleOwe: 0,
    youOwe: 0,
  });
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ 
    peopleOwe: 0, 
    youOwe: 0,
    totalLoanWithInterest: 0,
    totalAmount: 0,
    accruedInterest: 0,
    topUpInterest: 0,
    topUpTotal: 0,
    userId: "Ayush"
  });
    const [takenLoanTotals, setTakenLoanTotals] = useState({
      totalBorrowed: 0,
      totalInterest: 0,
      totalOutstanding: 0,
    });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isOpen, setIsOpen] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showMenuOptions, setShowMenuOptions] = useState(false);
  const [showSwitchOptions, setShowSwitchOptions] = useState(false);
  const menuRef = useRef(null);
  const quickActionsRef = useRef(null);
  const menuOptionsRef = useRef(null);
  const switchOptionsRef = useRef(null);
  const [error, setError] = useState(false);
  // const [latestLoan, setLatestLoan] = useState(null);
  const [stats, setStats] = useState({});
  

  const totalOutstanding = totals.totalLoanWithInterest;
  const TotalLand = totals.totalAmount;
      const TotalOS = totals.totalAmount + totals.topUpTotal;


  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
    return () => clearTimeout(timer);
  }, [message]);


  const REMINDER_API = 'https://aero31.vercel.app/api/reminders';


  const authHeaders = () => ({
  headers: { 'x-auth-token': localStorage.getItem('token') }
});

  const api = {
    getStats: async () => {
      try {
        const response = await axios.get(`${REMINDER_API}/stats`, authHeaders());
                console.log('Stats fetched:', response.data);

        return response.data;

      } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
      }
    },
  };

        const PING_BACKENDS = [
          { name: "Render Server", url: "https://folilar-backend30.onrender.com/api/ping" },
          { name: "Second Server", url: "https://aero31.vercel.app/api/ping" },
        ];
        
        const preloadBackend = async () => {
          try {
            const responses = await Promise.all(
              PING_BACKENDS.map(async (server) => {
                const response = await axios.get(server.url);
                console.log(`${server.name} responded with status:`, response.status);
                return { name: server.name, status: response.status };
              })
            );
            console.log("All servers warmed up:", responses);
          } catch (error) {
            console.error("Backend ping failed:", error);
          }
        };
        
        // Call it when the app starts
        preloadBackend();
        
  
  
  
useEffect(() => {
  const fetchData = async () => {
    try {
      const statsResponse = await api.getStats();
      setStats(statsResponse);
      console.log('Stats:', statsResponse);
    } catch (error) {
      console.error('Error fetching reminder stats:', error);
    }
  };

  fetchData(); // ← Add this line
}, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target) && 
          !event.target.closest('.byaj-add-button')) {
        setShowQuickActions(false);
      }
      if (menuOptionsRef.current && !menuOptionsRef.current.contains(event.target) && 
          !event.target.closest('.byaj-menu-button')) {
        setShowMenuOptions(false);
      }
      if (switchOptionsRef.current && !switchOptionsRef.current.contains(event.target) && 
          !event.target.closest('.byaj-switch-button')) {
        setShowSwitchOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://aero31.vercel.app/api/total-amount',
          { headers: { 'x-auth-token': token } });
        setLoading(false);
        setTotals(response.data);
        // Temporarily removed for testing UI
        // setMessage({ type: 'success', text: 'Successfully fetched total amount' });
        setError(false);
      } catch (error) {
        console.error('Error fetching totals:', error);
        setError(true);
        setTimeout(fetchTotals, 5000);
      }
    };
    fetchTotals();
  }, []);

  // useEffect(() => {
  //   const fetchLatestLoan = async () => {
  //     try {
  //       const token = localStorage.getItem('token');
  //       const response = await axios.get("https://aero31.vercel.app/api/latest-loan",
  //         { headers: { 'x-auth-token': token } });
  //       setLatestLoan(response.data);
  //       setError(false);
  //     } catch (error) {
  //       console.error("Error fetching latest loan:", error);
  //       setError(true);
  //       setTimeout(fetchLatestLoan, 5000);
  //     }
  //   };

  //   fetchLatestLoan();
  // }, []);


    useEffect(() => {
      const fetchTakenLoans = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('https://aero31.vercel.app/api/taken-loans',
            { headers: { 'x-auth-token': token } });
          
          const takenLoans = response.data.data || [];
          
          // Calculate total borrowed amount with interest
          let totalBorrowed = 0;
          let totalInterest = 0;
          
          takenLoans.forEach(loan => {
            const loanDetails = loan.loanDetails || {};
            const amount = loanDetails.amount || 0;
            const topUpTotal = loanDetails.topUpTotal || 0;
            const accruedInterest = loanDetails.accruedInterest || 0;
            const totalAmount = loanDetails.totalAmount || 0;
            
            // Calculate similar to given loans
            const P = topUpTotal + totalAmount;
            const grandTotal = P + accruedInterest;
            
            totalBorrowed += (amount + topUpTotal);
            totalInterest += accruedInterest;
          });
          
          const totalOutstanding = totalBorrowed + totalInterest;
          
          setTakenLoanTotals({
            totalBorrowed,
            totalInterest,
            totalOutstanding,
          });
          
          setLoading(false);
          setError(false);
        } catch (error) {
          console.error('Error fetching taken loans:', error);
          setError(true);
          setLoading(false);
        }
      };
      
      fetchTakenLoans();
    }, []);

  const confirmLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      showMessage("success", "You have been logged out.");
      window.location.href = "/login";
    }
  };

  const toggleQuickActions = () => {
    setShowQuickActions(!showQuickActions);
  };

  const toggleMenuOptions = () => {
    setShowMenuOptions(!showMenuOptions);
    // Close other menus
    setShowSwitchOptions(false);
    setShowQuickActions(false);
  };

  const toggleSwitchOptions = () => {
    setShowSwitchOptions(!showSwitchOptions);
    // Close other menus
    setShowMenuOptions(false);
    setShowQuickActions(false);
  };

  if (loading) {
    return <LoadSKL />;
  }

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



  const combinedTotalOutstanding = totals.totalLoanWithInterest + takenLoanTotals.totalOutstanding;



  return (
    <>
    <div className="byaj-home_l">
      <div className="byaj-home-container">
        {/* Header */}
        <div className="byaj-header">
          <div className="byaj-profile-section">
            <div className="byaj-profile-image">
              <FontAwesomeIcon icon={faUser} size="2x" />
            </div>
            <div className="byaj-user-info">
              <div className="byaj-username">{totals.userId}</div>
              <div className="byaj-workspace">Change Workspace</div>
            </div>
          </div>
          <div className="byaj-switch-button" onClick={toggleSwitchOptions}>
            Switch <FontAwesomeIcon icon={faAngleDown} />
            {showSwitchOptions && (
              <div className="byaj-switch-options" ref={switchOptionsRef}>
                <div className="byaj-switch-option active">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="byaj-switch-option-icon" />
                  <span>Loan Book</span>
                </div>
                <div className="byaj-switch-option"  onClick={() => navigate('/ac')}>
                  <FontAwesomeIcon icon={faClipboardList} className="byaj-switch-option-icon" />
                  <span>Account Book</span>
                </div>
              </div>
            )}
          </div>

          <button className="byaj-menu-button" onClick={toggleMenuOptions}>⋮
            {showMenuOptions && (
              <div className="byaj-menu-options" ref={menuOptionsRef}>
                <div className="byaj-menu-option" onClick={() => navigate('/profile')}>
                  <FontAwesomeIcon icon={faUser} className="byaj-menu-option-icon" />
                  <span>Profile</span>
                </div>
                <div className="byaj-menu-option">
                  <FontAwesomeIcon icon={faCog} className="byaj-menu-option-icon" />
                  <span>Settings</span>
                </div>
                {/* <div className="byaj-menu-option">
                  <FontAwesomeIcon icon={faAddressBook} className="byaj-menu-option-icon" />
                  <span>Address Book</span>
                </div> */}
                <div className="byaj-menu-option">
                  <FontAwesomeIcon icon={faUserCog} className="byaj-menu-option-icon" />
                  <span>Account</span>
                </div>
                <div className="byaj-menu-option" onClick={confirmLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="byaj-menu-option-icon" />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </button>
                  </div>

        {/* Balance Card */}
        <div className="byaj-balance-card">
          <div className="byaj-balance-title">Total Outstanding</div>
          <div className="byaj-balance-amount">₹ {formatToIndianCurrency(Math.floor(totals.totalLoanWithInterest || 0))}</div>
          <div className="byaj-balance-split">
            <div className="byaj-split-row" onClick={() => navigate('/customer_Profiles')}>
              <div className="byaj-split-left">
                <span className="byaj-split-label">Lend</span>
                <span className="byaj-split-amount">₹ {formatToIndianCurrency(Math.floor(TotalOS || 0))}</span>
              </div>
              <div className="byaj-icon-container byaj-green-icon">
                <FontAwesomeIcon icon={faArrowUp} />
              </div>
            </div>
            <div className="byaj-split-row" onClick={() => navigate('/borrowed-accounts')}>
              <div className="byaj-split-left">
                <span className="byaj-split-label">Borrowed</span>
                <span className="byaj-split-amount">₹ {formatToIndianCurrency(Math.floor(takenLoanTotals.totalOutstanding || 0))}</span>
              </div>
              <div className="byaj-icon-container byaj-red-icon">
                <FontAwesomeIcon icon={faArrowDown} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="byaj-action-grid">
          <div className="byaj-action-card" onClick={() => navigate('/customer_Profiles')}>
            <div className="byaj-action-icon">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div className="byaj-action-label">Profiles</div>
          </div>
          <div className="byaj-action-card">
            <div className="byaj-action-icon">
              <FontAwesomeIcon icon={faGift} />
            </div>
            <div className="byaj-action-label">Refer & Earn</div>
            <div className="byaj-action-subtext">₹500</div>
          </div>
          <div className="byaj-action-card" onClick={() => navigate('/transaction')}>
            <div className="byaj-action-icon">
              <FontAwesomeIcon icon={faExchangeAlt} />
            </div>
            <div className="byaj-action-label">Transactions</div>
          </div>
          <div className="byaj-action-card" onClick={() => navigate('/graph')}>
            <div className="byaj-action-icon">
              <FontAwesomeIcon icon={  faChartLine} />
            </div>
            <div className="byaj-action-label">Reports</div>
          </div>
        </div>

        {/* Notice Box */}
        {/* <div className="byaj-notice-box">
          <div className="byaj-notice-heading">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span>Notice</span>
          </div>
          <div className="byaj-notice-content">
            Iss App se Loan nahi milta hai!!
          </div>
          <a href="#" className="byaj-notice-link">Show Details</a>
        </div> */}

        {/* Features Row */}
        <div className="byaj-feature-row">
          <div className="byaj-feature-button">
            <div className="byaj-feature-icon">
              <FontAwesomeIcon icon={faBell} />
            </div>
            <div className="byaj-feature-label">Reminders</div>
          </div>
          <div className="byaj-feature-button" navigate="/graph">
            <div className="byaj-feature-icon">
              <FontAwesomeIcon icon={faFileAlt} />
            </div>
            <div className="byaj-feature-label">Report</div>
          </div>
        </div>

        {/* Premium Features */}
        {/* <div className="byaj-premium-section">
          <div className="byaj-premium-header">
            <div className="byaj-premium-title">
              <div className="byaj-star-icon">
                <FontAwesomeIcon icon={faStar} />
              </div>
              <span>Full premium features</span>
            </div>
            <div className="byaj-new-badge">New</div>
          </div>
          <div className="byaj-premium-grid">
            <div className="byaj-premium-item">
              <div className="byaj-premium-icon">
                <FontAwesomeIcon icon={faBell} />
              </div>
              <div className="byaj-premium-label">Reminder Credits</div>
            </div>
            <div className="byaj-premium-item">
              <div className="byaj-premium-icon">
                <FontAwesomeIcon icon={faGlobe} />
              </div>
              <div className="byaj-premium-label">Desktop version</div>
            </div>
            <div className="byaj-premium-item">
              <div className="byaj-premium-icon">
                <FontAwesomeIcon icon={faLock} />
              </div>
              <div className="byaj-premium-label">Security Lock</div>
            </div>
            <div className="byaj-premium-item">
              <div className="byaj-premium-icon">
                <FontAwesomeIcon icon={faQuestion} />
              </div>
              <div className="byaj-premium-label">help</div>
            </div>
          </div>
        </div> */}

        {/* Alerts Section */}
        <div className="byaj-alerts-section">
          <div className="byaj-alerts-header">
            <FontAwesomeIcon icon={faInfoCircle} className="byaj-alert-icon" />
            <span>Alerts</span>
          </div>
          <div className="byaj-due-loans">
            <div className="byaj-due-loans-left">
              <FontAwesomeIcon icon={faBell} className="byaj-clock-icon" />
              <div className="byaj-due-loans-content">
                {/* <div className="byaj-due-loans-title">Due Loans Today</div>
                <div className="byaj-due-loans-subtitle">No due loans today.</div>
                        <div className="stats-number stats-number-orange">{stats.dueToday}</div> */}
              <div className="byaj-due-loans-title">
                  Due Reminders Today
                </div>
                <div 
                  className="byaj-due-loans-subtitle"
onClick={() => navigate('/ac', { state: { stats } })}
                  style={{ color: '#2563eb', cursor: 'pointer' }}
                >
                  {stats.dueToday > 0 ? `View ${stats.dueToday} reminders` : 'No due reminders'}
                </div>

              </div>
            </div>
            <FontAwesomeIcon icon={faChevronRight} className="byaj-chevron-icon" />
          </div>
          <div className="byaj-overdue-grid">
            <div className="byaj-overdue-card">
              <FontAwesomeIcon icon={faUsers} className="byaj-overdue-icon" />
              <div className="byaj-overdue-content">
                <div className="byaj-overdue-title">Overdue</div>
                <div className="byaj-overdue-subtitle">Loans</div>
              </div>
            </div>
            <div className="byaj-overdue-card">
              <FontAwesomeIcon icon={faFileAlt} className="byaj-overdue-icon" />
              <div className="byaj-overdue-content">
                <div className="byaj-overdue-title">Collaterals</div>
                <div className="byaj-overdue-subtitle">Overdue</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tutorial Banner */}
        {/* <div className="byaj-tutorial-banner">
          <div className="byaj-tutorial-content">
            <div className="byaj-tutorial-title">How to use ByajBook ?</div>
            <button className="byaj-tutorial-button">
              <span>Watch Now</span>
              <FontAwesomeIcon icon={faPlay} />
            </button>
          </div>
          <div className="byaj-tutorial-image">
            <div className="byaj-video-thumbnail">
              <FontAwesomeIcon icon={faTicketAlt} size="2x" color="#fff" />
            </div>
          </div>
        </div> */}

        {/* Bottom Navigation */}
        <div className="byaj-bottom-nav">
          <div className="byaj-nav-item active">
            <FontAwesomeIcon icon={faHome} className="byaj-nav-icon" />
            <span className="byaj-nav-label">Home</span>
          </div>
          <div className="byaj-nav-item" onClick={() => navigate('/lend-accounts')}>
            <FontAwesomeIcon icon={faMoneyBillWave} className="byaj-nav-icon" />
            <span className="byaj-nav-label">Lent</span>
          </div>
          <div className="byaj-nav-item" onClick={() => navigate('/borrowed-accounts')}>
            <FontAwesomeIcon icon={faHandHoldingUsd} className="byaj-nav-icon" />
            <span className="byaj-nav-label">Borrowed</span>
          </div>
          <div className="byaj-nav-item" onClick={() => navigate('/customer_Profiles')}>
            <FontAwesomeIcon icon={faUsers} className="byaj-nav-icon" />
            <span className="byaj-nav-label">People</span>
          </div>
        </div>

        {/* Add Button */}
        <div className="byaj-add-button-container" ref={quickActionsRef}>
          <div className="byaj-add-button" onClick={toggleQuickActions}>
            <FontAwesomeIcon icon={faPlus} />
          </div>
          
          {/* Quick Action Menu */}
          {showQuickActions && (
            <div className="byaj-quick-actions-menu">
              <div className="byaj-quick-action-item" onClick={() => navigate('/land_money_form')}>
                <FontAwesomeIcon icon={faMoneyBillWave} className="byaj-quick-action-icon" />
                <span>Give Loan</span>
              </div>
              <div className="byaj-quick-action-item" onClick={() => navigate('/lenderform')}>
                <FontAwesomeIcon icon={faHandHoldingUsd} className="byaj-quick-action-icon" />
                <span>Take Loan</span>
              </div>
            </div>
          )}
          
        </div>
      </div> 
      {message.text && <Message type={message.type} text={message.text} />}
      {error && <Message type="error" text="Error fetching data. Retrying..." />}
      {loading && <LoadSKL />}
      </div>
    </>
  );  
}

export default HomePage;