import WeddingCards from "../Categories/WeddingCards";
import Categories from "../Components/Categories";
import Hero from "../Components/Hero";
import Navbar from "../Components/Navbar";

function Home(){
    return(
        <div>
            <Navbar/>
            <Hero/>
            <Categories/>
            <WeddingCards/>
        </div>
    )
}

export default Home;