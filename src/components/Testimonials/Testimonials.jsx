import "./Testimonials.css";

import {
  FaStar,
  FaQuoteLeft
} from "react-icons/fa";


const reviews = [

{
name:"Arun Kumar",
location:"Chennai",
image:
"https://randomuser.me/api/portraits/men/32.jpg",
review:
"Amazing experience! The homestay was clean, peaceful and the location near Hogenakkal Falls was beautiful.",
rating:"5"
},


{
name:"Priya Sharma",
location:"Bangalore",
image:
"https://randomuser.me/api/portraits/women/44.jpg",
review:
"Perfect weekend getaway with family. Great hospitality and comfortable rooms.",
rating:"5"
},


{
name:"Rahul Raj",
location:"Coimbatore",
image:
"https://randomuser.me/api/portraits/men/75.jpg",
review:
"The booking process was very easy. Highly recommended for nature lovers.",
rating:"4.8"
}

];


function Testimonials(){

return(

<section className="testimonial-section">


<div className="testimonial-container">


<div className="testimonial-heading">

<h2>
What Our Guests Say
</h2>

<p>
Thousands of travelers trust HogenakkalHomeStay
</p>

</div>



<div className="testimonial-grid">


{
reviews.map((item,index)=>(


<div 
className="testimonial-card"
key={index}
>


<FaQuoteLeft className="quote-icon"/>



<div className="user-info">


<img 
src={item.image}
alt={item.name}
/>


<div>

<h3>
{item.name}
</h3>

<p>
{item.location}
</p>

</div>


</div>



<div className="stars">

{
[1,2,3,4,5].map((star)=>(
<FaStar key={star}/>
))
}

</div>



<p className="review-text">

"{item.review}"

</p>



</div>


))
}


</div>


</div>


</section>

)

}


export default Testimonials;