import "./Newsletter.css";

import {
  FaPaperPlane
} from "react-icons/fa";


function Newsletter(){

return(

<section className="newsletter-section">


<div className="newsletter-container">


<div className="newsletter-content">

<h2>
Get Travel Updates & Exclusive Deals
</h2>


<p>
Subscribe to receive special offers,
new stays and travel inspiration.
</p>


</div>



<div className="newsletter-form">


<input
type="email"
placeholder="Enter your email address"
/>


<button>

Subscribe

<FaPaperPlane/>

</button>


</div>


</div>


</section>

)

}


export default Newsletter;