import "./Contact.css";

function Contact() {

  return (

    <div className="contact-page">


      {/* HERO SECTION */}

      <section className="contact-hero">


        <div className="contact-hero-content">


          <h1>
            Contact HogenakkalHomeStay
          </h1>


          <p>
            Plan your perfect stay near
            Hogenakkal Falls. Our team is
            ready to help you.
          </p>


        </div>


      </section>





      {/* CONTACT SECTION */}


      <section className="contact-section">





        <div className="contact-info">



          <div className="contact-card">


            <h2>
              Location
            </h2>


            <p>
              Hogenakkal Falls,
              Tamil Nadu, India
            </p>


          </div>





          <div className="contact-card">


            <h2>
              Phone
            </h2>


            <p>
              +91 78717 79134
            </p>


          </div>





          <div className="contact-card">


            <h2>
              Email
            </h2>


            <p>
              support@hogenakkalhomestay.com
            </p>


          </div>



        </div>







        {/* FORM */}


        <div className="contact-form">


          <h2>
            Send Enquiry
          </h2>



          <p>
            Tell us about your travel plan
          </p>




          <input

            type="text"

            placeholder="Your Name"

          />





          <input

            type="email"

            placeholder="Your Email"

          />





          <input

            type="text"

            placeholder="Phone Number"

          />





          <textarea

            placeholder="Your Message"

          ></textarea>





          <button>

            Submit Enquiry

          </button>




        </div>



      </section>



    </div>

  );

}


export default Contact;