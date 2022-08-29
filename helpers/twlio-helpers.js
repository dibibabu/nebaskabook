require('dotenv').config()

const client = require('twilio')(process.env.ACCOUNT_SID,process.env.AUTH_TOKEN);
const serviceSid=process.env.TWILIO_SERVICE_ID

             module.exports={
                dosms:(noData)=>{
                    let res={}
                    return new Promise(async(resolve,reject)=>{
                        await client.verify.services(serviceSid).verifications.create({
                            to :`+91${noData.phone}`,
                            channel:"sms"
                        }).then((res)=>{
                            res.valid=true;
                            resolve(res)
                            console.log('doooooooooooooooosign');
                            console.log(res);
                        })
                    })
                },
                otpVerify:(otpData,nuData)=>{
                    let resp={}

                    console.log(otpData.otp);
                    return new Promise(async(resolve,reject)=>{
                        await client.verify.services(serviceSid).verificationChecks.create({
                            to:   `+91${nuData.phone}`,
                            code:otpData.otp
                        }).then((resp)=>{
                            // console.log("verification success");
                            // console.log(resp);
                            resolve(resp)
                        })
                    })
                }

             }