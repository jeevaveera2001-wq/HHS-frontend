    import "./Dashboard.css";

import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";


function Dashboard() {

  const { user, logout } = useAuth();

  const navigate = useNavigate();



  const handleLogout = () => {

    logout();

    navigate("/login");

  };



  return (

    <div className="dashboard-page">


      <div className="dashboard-container">


        {/* Welcome Card */}

        <div className="dashboard-header">


          <div>

            <h1>
              Welcome back, {user?.fullName} 👋
            </h1>


            <p>
              Manage your stays and explore new experiences.
            </p>

          </div>


          <button

            className="logout-btn"

            onClick={handleLogout}

          >

            Logout

          </button>


        </div>




        {/* Profile Section */}


        <div className="dashboard-grid">


          <div className="profile-card">


            <div className="avatar">

              {user?.fullName
                ?.charAt(0)
                .toUpperCase()
              }

            </div>


            <h2>
              {user?.fullName}
            </h2>


            <p>
              {user?.email}
            </p>


            <p>
              {user?.phone}
            </p>


            <span>
              {user?.role || "Customer"}
            </span>


          </div>





          {/* Booking Card */}


          <div className="info-card">


            <h2>
              My Bookings
            </h2>


            <div className="empty-state">

              <h3>
                No bookings yet
              </h3>


              <p>
                Explore beautiful homestays near Hogenakkal Falls.
              </p>


              <button

                onClick={() => navigate("/explore")}

              >

                Explore Stays

              </button>


            </div>


          </div>





          {/* Saved Properties */}


          <div className="info-card">


            <h2>
              Saved Properties
            </h2>


            <p className="coming">

              Your favourite stays will appear here.

            </p>


          </div>



        </div>


      </div>


    </div>

  );

}


export default Dashboard;