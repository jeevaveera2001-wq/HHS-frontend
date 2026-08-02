import Hero from "../../components/Hero/Hero";
import SearchBar from "../../components/SearchBar/SearchBar";
import Categories from "../../components/Categories/Categories";
import FeaturedProperties from "../../components/FeaturedProperties/FeaturedProperties";
import WhyChooseUs from "../../components/WhyChooseUs/WhyChooseUs";
import Testimonials from "../../components/Testimonials/Testimonials";
import PopularPlaces from "../../components/PopularPlaces/PopularPlaces";
import SpecialOffers from "../../components/SpecialOffers/SpecialOffers";
import AppDownload from "../../components/AppDownload/AppDownload";
import Newsletter from "../../components/Newsletter/Newsletter";

function Home() {
  return (
    <>
      <Hero />
      <SearchBar />
      <Categories />
      <FeaturedProperties />
      <WhyChooseUs />
      <Testimonials />
      <PopularPlaces/>
      <SpecialOffers/>
      <AppDownload/>
      <Newsletter/>

    </>
  );
}

export default Home;