import "./PopularPlaces.css";

import {
  FaMapMarkerAlt
} from "react-icons/fa";


const places = [

{
title:"Hogenakkal Falls",
location:"Dharmapuri, Tamil Nadu",
image:
"https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=900",
description:
"Experience the breathtaking beauty of waterfalls and nature."
},


{
title:"Coracle Boat Ride",
location:"Cauvery River",
image:
"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900",
description:
"Enjoy traditional boat rides through the beautiful river."
},


{
title:"Mettur Dam",
location:"Salem District",
image:
"https://images.unsplash.com/photo-1500534623283-312aade485b7?w=900",
description:
"A peaceful destination surrounded by scenic landscapes."
},


];


function PopularPlaces(){

return(

<section className="places-section">


<div className="places-container">


<div className="places-heading">

<h2>
Explore Nearby Attractions
</h2>

<p>
Discover amazing places around Hogenakkal
</p>

</div>



<div className="places-grid">


{
places.map((place,index)=>(


<div
className="place-card"
key={index}
>


<div className="place-image">

<img
src={place.image}
alt={place.title}
/>


<div className="location-tag">

<FaMapMarkerAlt/>

{place.location}

</div>


</div>



<div className="place-content">


<h3>
{place.title}
</h3>


<p>
{place.description}
</p>


<button>
Explore More
</button>


</div>


</div>


))
}


</div>


</div>


</section>

)

}


export default PopularPlaces;