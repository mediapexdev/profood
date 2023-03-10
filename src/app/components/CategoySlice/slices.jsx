import { SliceWidget } from "./slice";

const SlicesList = ({ selectedCategory }) => {
  //   const [slices, setslices] = useState([]);
  // console.log(selectedCategory[0].slices);
  if(selectedCategory.length>0){
  return (    
    <div className="d-flex flex-wrap d-grid gap-3 gap-xl-9" >
      {selectedCategory[0].slices.map((slice) => (
        <div key={slice.id} className="col">
          <SliceWidget slice={slice}/>
        </div>
      ))}
    </div>
  );
  }
  else{
  return(
    <div className="pt-50"><center>Entrain de charger</center></div>
  );
  }
};

export default SlicesList;
