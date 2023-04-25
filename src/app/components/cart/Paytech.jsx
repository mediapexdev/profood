import {useEffect} from 'react';
import $ from 'jquery';
const Paytech=()=>{
    useEffect(()=>{
        //   $("#pay").on("click",function buy() {
        //     alert('clicked');
        //     console.log('clicked');
        //     new window.PayTech({
        //       command_id: 1, //will be sent to paiement.php page
        //     })
        //       .withOption({
        //         requestTokenUrl: "http://localhost:8000/api/send-payment/",
        //         method: "POST",
        //         headers: {
        //           Accept: "text/html",
        //         },
        //         prensentationMode: window.PayTech.OPEN_IN_POPUP,
        //         willGetToken: function () {},
        //         didGetToken: function (token, redirectUrl) {
        //           console.log(token + " " + redirectUrl);
        //         },
        //         didReceiveError: function (error) {},
        //         didReceiveNonSuccessResponse: function (jsonResponse) {},
        //       })
        //       .send();
        //   }
        // )
    }
    )
    function buy() {
        alert('clicked');
        console.log('clicked');
        new window.PayTech({
          command_id: 1, //will be sent to paiement.php page
        })
          .withOption({
            requestTokenUrl: "https://api-profood.herokuapp.com/api/send-payment/",
            method: "POST",
            headers: {
              Accept: "text/html",
            },
            prensentationMode: window.PayTech.OPEN_IN_POPUP,
            willGetToken: function () {},
            didGetToken: function (token, redirectUrl) {
              console.log(token + " " + redirectUrl);
            },
            didReceiveError: function (error) {},
            didReceiveNonSuccessResponse: function (jsonResponse) {},
          })
          .send();
      }
      return (<div>
                <button className="btn btn-primary" id="pay" onClick={()=>buy()}>Commander Maintenant</button>
             </div>);
    }

export default Paytech;