import "./SpecialOffers.css";

import {
  FaTag,
  FaArrowRight
} from "react-icons/fa";


const offers = [

{
title:"Weekend Escape",
discount:"30% OFF",
description:
"Enjoy a relaxing weekend stay surrounded by nature.",
color:"blue"
},


{
title:"Family Vacation Package",
discount:"25% OFF",
description:
"Comfortable stays with family-friendly facilities.",
color:"green"
},


{
title:"Couple Retreat",
discount:"20% OFF",
description:
"Romantic riverside stays with beautiful views.",
color:"purple"
}


];


function SpecialOffers(){

return(

<section className="offers-section">


<div className="offers-container">


<div className="offers-heading">

<h2>
Exclusive Offers
</h2>

<p>
Special deals for your unforgettable Hogenakkal trip
</p>

</div>



<div className="offers-grid">


{
offers.map((offer,index)=>(


<div
className={`offer-card ${offer.color}`}
key={index}
>


<div className="discount">

<FaTag/>

{offer.discount}

</div>



<h3>
{offer.title}
</h3>


<p>
{offer.description}
</p>



<button>

Book Now

<FaArrowRight/>

</button>


</div>


))
}


</div>


</div>


</section>

)

}


export default SpecialOffers;