import "./Categories.css";

const categories = [
  {
    title: "Luxury Homestays",
    count: "120+ Properties",
    image:
      "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=900",
  },

  {
    title: "Premium Resorts",
    count: "50+ Resorts",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900",
  },

  {
    title: "Nature Camping",
    count: "30+ Camps",
    image:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=900",
  },

  {
    title: "River View Villas",
    count: "80+ Stays",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900",
  },
];


function Categories(){

return(

<section className="category-section">


<div className="category-container">


<div className="category-heading">

<h2>
Explore Stay Categories
</h2>

<p>
Find the perfect accommodation for your Hogenakkal trip
</p>

</div>



<div className="category-grid">


{
categories.map((category,index)=>(

<div 
className="category-card"
key={index}
>


<img 
src={category.image}
alt={category.title}
/>


<div className="category-overlay">


<div>

<h3>
{category.title}
</h3>

<p>
{category.count}
</p>

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


export default Categories;