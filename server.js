const express=require('express');
const fs= require('fs');
let moment = require('moment');
const app= express();
app.use(express.static('assets'))
app.use('/',(req,res)=>{
    fs.readFile('./assets/clinical_metrics.json',(error,file_data)=>{ // to read from from source
        if(!error){
            const newDate=new Date();
            const currentTime = moment(newDate).format('HH:mm').split(':');
            const next15Min=moment(newDate).add(15, 'm').format('HH:mm').split(':');
            let getMeasure= [];
            const dataFilter=JSON.parse(file_data).clinical_data.HEART_RATE.data.filter((item)=>{
            const recordDate=item.on_date.split('T')[1].split(':');
               
                if((currentTime[0]==recordDate[0] || next15Min[0]==recordDate[0])){ // to checking hours
                    if((currentTime[1]<=recordDate[1] && next15Min[1]>=recordDate[1])){ // to checking minutes
                    getMeasure.push(item.measurement);// filter measurement
                    return item.on_date;
                    }
                }
           }).map((data)=>{
                    let min = Math.min(...getMeasure); // get min measure
                    let max = Math.max(...getMeasure); // get max measurement
                    return {
                        from_date : moment(data.on_date),
                        to_date : moment(data.on_date).add(15, 'm'),
                        measurement : {
                            low : min,
                            high: max
                        }
                        
                       
                 }
            });
           // we can use further processing if use to save data postgre db
            if(dataFilter.length){
                res.status(200).json({
                'result':dataFilter,
                'msg' : 'file data recieved successfully',
                'status' : 1
            });
            }else{
                res.status(200).json({
                    'result':[],
                    'msg' : 'there is no data with that timeframe.',
                    'status' : 0
                });
            }
            }else{
                    res.status(200).json({
                        'result':[],
                        'msg' : 'There is some issue while reading file',
                        'status' : 0               
                    }); 
                }
         
    });
           
}).listen(8080,(error)=>{
       if(!error)
         console.log('Server is started successfully.');
})