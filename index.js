import express, { response } from 'express'
import cors from 'cors';
import {randomUUID} from "crypto";
import dotenv from "dotenv";
import axios from 'axios';
import { StandardCheckoutClient,StandardCheckoutPayRequest,StandardCheckoutPayResponse,Env } from "pg-sdk-node";
import crypto from 'crypto';

dotenv.config();
const app=express();
app.use(express.json());
app.use(cors());



const clientId=process.env.CLIENT_ID;
const clientSecret=process.env.CLIENT_SECRET;
const clientVersion=process.env.CLIENT_VERSION;
const   REACT_APP_API_URL=process.env.REACT_APP_API_URL
const env=Env.PRODUCTION // for testing

const client=StandardCheckoutClient.getInstance(clientId,clientSecret,clientVersion,env)
let amt=0;
console.log(client);
app.get('/h',async (req,res)=>{
    console.log("hello")
   return res.send("hello");
})
app.post('/create-checkout',async (req,res)=>{
    try{
            console.log("RUNNING PHONE PE---------")
        // console.log(req.body);
        const {
            MUID,
            price,

            quantity,

            transactionID

        }=req.body
        // console.log("-->"+req.body)
        if(!price)
        {
            return res.status(400).send("amount is required");
        }

        const merchantOrderId=transactionID;
        
        const redirectUrl=`https://backendr1.onrender.com/check-status?merchantOrderId=${merchantOrderId}` 

        const request=StandardCheckoutPayRequest.builder()
        .merchantOrderId(merchantOrderId)
        .amount(price*100)
        .expireAfter(1200)
        .message("Requesting Payment")
        .metaInfo({udf1:`quantity-${quantity}`})
        .redirectUrl(redirectUrl)
        .build();
        console.log(request);

      const response=await client.pay(request);

        console.log(response);
        return res.json({
            checkoutPageUrl:response.redirectUrl
        })
    // return res.json(req.body);

    }

    catch(error)
    {
        console.log("error creating order "+error)
        res.status(500).send("error creating order")
    }
})
app.post('/deposit',async (req,res)=>{
    try{
            console.log("RUNNING PHONE PE for deposit amount---------")
        // console.log(req.body);
        const {
            MUID,
            price,
            name,
            id,
            transactionID

        }=req.body
        // console.log("-->"+req.body)
        if(!price)
        {
            return res.status(400).send("amount is required");
        }

        const merchantOrderId=transactionID;
        
        const redirectUrl=`https://backendr1.onrender.com/deposit-status?merchantOrderId=${merchantOrderId}&price=${price}&id=${id}` 

        const request=StandardCheckoutPayRequest.builder()
        .merchantOrderId(merchantOrderId)
        .amount(price*100)
        .expireAfter(1200)
        .message("Requesting Payment")
        .metaInfo({udf1:`amount deposited by-${name}`})
        .redirectUrl(redirectUrl)
        .build();
        console.log(request);

      const response=await client.pay(request);

        console.log(response);
        return res.json({
            checkoutPageUrl:response.redirectUrl
        })
    // return res.json(req.body);

    }

    catch(error)
    {
        console.log("error creating order "+error)
        res.status(500).send("error creating order")
    }
})

app.get('/check-status',async (req,res)=>{

    try {

      const  {
merchantOrderId
        }=req.query;
        if(!merchantOrderId)
        {
            return res.status(400).send("Order Id not present");
        }



      const response=await client.getOrderStatus(merchantOrderId);

      const status=response.state
      if(status==="COMPLETED")
      {
       return res.redirect("https://nextgen-project.tech/#/payment/success")
      }
      else{
        return res.redirect("https://nextgen-project.tech/#/payment/failed");
      }


    } catch (error) {
        console.log(error);
        return res.status(500).send("ERROR");
    }
   
})


app.get('/deposit-status',async (req,res)=>{

    try {

      const  {
merchantOrderId,
price,
id
        }=req.query;
        if(!merchantOrderId)
        {
            return res.status(400).send("Order Id not present");
        }



      const response=await client.getOrderStatus(merchantOrderId);

      const status=response.state
      if(status==="COMPLETED")
      {
        try {
            console.log("deposit status updating");
             await axios.get(`${REACT_APP_API_URL}/${id}`).then(resp => {
                 console.log(resp.data.wallet);
                amt=Number(resp.data.wallet)+Number(price);
             }).catch(error=>{
                 console.log(error);
             });
            
            
            

             // alert("total amt"+amt);
            axios.put(`${process.env.REACT_APP_API_URL}/${id}`, { wallet:amt }).then(resp => {console.log(resp.data);
         
         
         }).catch(error=>{
                 console.log(error);
            }
);
             console.log('Deposit status updated successfully');
}
          catch (error) {
             alert(error);
             console.error('Error updating deposit status:', error);
         }
        


         
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    function encrypt(text) {
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return { encryptedData: encrypted, iv: iv.toString('hex'), key: key.toString('hex') };
    }
    // Example usage
    const encrypted = encrypt(Number(price+id).toString());
    console.log('Encrypted:', encrypted);

       
       return res.redirect(`https://nextgen-project.tech/#/deposit/success?` + 
    `data=${encodeURIComponent(encrypted.encryptedData+"SHAZEV"+encrypted.encryptedData)}&` +
    `iv=${encodeURIComponent(encrypted.iv+"UMAIR"+encrypted.iv)}&` +
    `key=${encodeURIComponent(encrypted.key+"IMAAD"+encrypted.key)
      }`)}
      else{
        return res.redirect("https://nextgen-project.tech/#/deposit/failed");
      }


    } catch (error) {
        console.log(error);
        return res.status(500).send("ERROR");
    }
   
})



app.listen(8000,()=>{
    console.log("Server is running on port 8000");
})












