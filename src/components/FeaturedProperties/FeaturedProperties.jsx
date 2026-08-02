import "./FeaturedProperties.css";
import { FaStar, FaHeart, FaMapMarkerAlt } from "react-icons/fa";

const properties = [
  {
    id:1,
    name:"River View Luxury Cottage",
    location:"Near Hogenakkal Falls",
    price:"₹3500",
    rating:"4.9",
    image:
    "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=800"
  },

  {
    id:2,
    name:"Nature Resort Stay",
    location:"Pennagaram Road",
    price:"₹4500",
    rating:"4.8",
    image:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
  },

  {
    id:3,
    name:"Family Homestay",
    location:"Hogenakkal Village",
    price:"₹2500",
    rating:"4.7",
    image:
    "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800"
  },

  {
    id:4,
    name:"Premium Riverside Villa",
    location:"Cauvery River Side",
    price:"₹6000",
    rating:"5.0",
    image:
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
  }
];


function FeaturedProperties(){

return(

<section className="featured-section">


<div className="featured-container">


<div className="section-heading">

<h2>
Featured Homestays
</h2>

<p>
Discover handpicked stays for your perfect vacation
</p>

</div>



<div className="property-grid">


{
properties.map((property)=>(


<div 
className="property-card"
key={property.id}
>


<div className="image-box">


<img 
src={property.image}
alt={property.name}
/>


<button className="wishlist">

<FaHeart/>

</button>


</div>



<div className="property-content">


<div className="rating">

<FaStar/>

<span>
{property.rating}
</span>

</div>


<h3>
{property.name}
</h3>


<p className="location">

<FaMapMarkerAlt/>

{property.location}

</p>


<div className="bottom">


<h4>
{property.price}
<span>
 / night
</span>
</h4>


<button>
View Details
</button>


</div>


</div>


</div>


))
}


</div>


</div>


</section>

)

}


export default FeaturedProperties;