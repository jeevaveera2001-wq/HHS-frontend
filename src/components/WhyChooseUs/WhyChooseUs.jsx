import "./WhyChooseUs.css";

import {
  FaShieldAlt,
  FaWallet,
  FaHome,
  FaHeadset
} from "react-icons/fa";


const features = [

{
icon:<FaShieldAlt/>,
title:"Secure Booking",
description:
"Safe and reliable booking experience with instant confirmation."
},


{
icon:<FaWallet/>,
title:"Best Price Guarantee",
description:
"Get affordable stays with transparent pricing and no hidden charges."
},


{
icon:<FaHome/>,
title:"Verified Properties",
description:
"Every homestay is carefully verified for quality and comfort."
},


{
icon:<FaHeadset/>,
title:"24/7 Support",
description:
"Our support team is always ready to help you anytime."
}

];


function WhyChooseUs(){

return(

<section className="why-section">


<div className="why-container">


<div className="why-heading">

<h2>
Why Choose HogenakkalHomeStay?
</h2>

<p>
Making your holiday comfortable, safe and memorable.
</p>

</div>



<div className="why-grid">


{
features.map((item,index)=>(

<div 
className="why-card"
key={index}
>


<div className="why-icon">

{item.icon}

</div>


<h3>
{item.title}
</h3>


<p>
{item.description}
</p>


</div>

))
}


</div>


</div>


</section>

)

}


export default WhyChooseUs;