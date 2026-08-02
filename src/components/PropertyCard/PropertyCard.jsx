import { FaStar, FaMapMarkerAlt, FaHeart } from "react-icons/fa";

function PropertyCard({ property }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300">

      <div className="relative">
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-60 object-cover"
        />

        <button className="absolute top-4 right-4 bg-white p-2 rounded-full shadow">
          <FaHeart className="text-red-500" />
        </button>
      </div>

      <div className="p-5">

        <h3 className="text-xl font-bold">
          {property.name}
        </h3>

        <p className="flex items-center gap-2 text-gray-500 mt-2">
          <FaMapMarkerAlt />
          {property.location}
        </p>

        <div className="flex items-center justify-between mt-4">

          <span className="flex items-center gap-2 text-yellow-500">
            <FaStar />
            {property.rating}
          </span>

          <span className="text-blue-700 font-bold text-xl">
            ₹{property.price}
            <span className="text-gray-500 text-sm">
              /night
            </span>
          </span>

        </div>

        <button className="w-full mt-5 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700">
          View Details
        </button>

      </div>
    </div>
  );
}

export default PropertyCard;