import Categories from "../../components/categories/categories";
import { useSelector } from "react-redux";
import api from "../../../api/api";
import { useEffect, useState } from "react";
import SlicesList from "../../components/slices/slices";
import TypeBoxWidget from "../../components/TypeBoxWidget";
import { Elements } from "../../components/slices/elements";

const Slices = () => {
  const [categories, setCategories] = useState([]);
  const [typeBox, setTypeBox] = useState([]);
  useEffect(() => {
    api.get("get-slices-by-Box/1").then((res) => {
      setCategories(res.data["categories"]);
      setTypeBox(res.data["typeBox"]);
    });
  }, []);
  const selectedCategoryId = useSelector(
    (state) => state.slice.selectedCategory
  );
  const selectedCategory = categories.filter(
    (category) => category.id === selectedCategoryId
  );
  // console.log(selectedCategory);
  return (
    <div className="container-fluid">
      <section id="sectionSlices" className="section-slices section-boxed">
        <div className="section-container container-fluid mx-auto">            
          <div className="row">
            <div className="col-3 position-relative">
              <div className="row"><Categories categories={categories} /></div>
              <div className="row"><Elements/> </div>
            </div>            
            <div className="col-9">
            <div className="row w-100 m-3">
              <TypeBoxWidget typeBox={typeBox} />
            </div>
            <div className="row w-100 ms-0">
              <SlicesList selectedCategory={selectedCategory} />
            </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Slices;
