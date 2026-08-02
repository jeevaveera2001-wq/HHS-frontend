import "./AppDownload.css";

import {
  FaApple,
  FaGooglePlay,
  FaCheckCircle
} from "react-icons/fa";


const features = [
  "Instant booking confirmation",
  "Exclusive mobile offers",
  "Manage your trips easily",
  "24/7 customer support"
];


function AppDownload(){

return(

<section className="app-section">


<div className="app-container">


<div className="app-content">


<span className="app-badge">
Travel Anywhere
</span>


<h2>
Book Your Stay
Anywhere, Anytime
</h2>


<p>
Download the HogenakkalHomeStay app and enjoy
faster bookings, exclusive deals and a seamless
travel experience.
</p>



<div className="app-features">

{
features.map((item,index)=>(

<div 
className="app-feature"
key={index}
>

<FaCheckCircle/>

<span>
{item}
</span>

</div>

))
}

</div>



<div className="store-buttons">


<button className="store-btn">

<FaApple/>

<div>
<small>
Download on the
</small>

<strong>
App Store
</strong>

</div>

</button>



<button className="store-btn">

<FaGooglePlay/>

<div>

<small>
GET IT ON
</small>

<strong>
Google Play
</strong>

</div>

</button>


</div>


</div>




<div className="phone-screen">

<div className="mobile-logo">

<span>
HHS
</span>

</div>


<h3>
HogenakkalHomeStay
</h3>


<p>
Your Perfect Stay
</p>


<div className="mobile-card">

🏡 Luxury Stays

</div>


<div className="mobile-card">

🌊 Hogenakkal Experiences

</div>


</div>

</div>



</section>

)

}


export default AppDownload;