const client = require('twilio')('ACbd6283436517b391e2f750b8917827dd','2a1cca214e625944b9210a9d4b0b0d09');
const serviceSid='VA12c097dad159e22c80725cca9ef9f0c5'

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