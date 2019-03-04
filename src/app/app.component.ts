import { Component, ViewChild} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as CanvasJS from '../lib/canvasjs.min';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
    constructor(private http: HttpClient){}


    //data string from aws api
    dataStr: string;
    latestDataStr:string;

    // sigfox data sets
    


    dayBegin:string = (new Date().setHours(0,0,0,0)).toString(); //ms of dayBegin
    dayEnd:string = (new Date().setHours(23,59,59,999)).toString();;  //ms of dayEnd
    latestDbTimestamp:string =(new Date().getTime()).toString();

    ngOnInit(){

        //this.showData();
        //await this.geInittData();
        
        // this.processInitData();
        // console.log(this.tempData );

        let tempData = [];
        let humData = [];

        var dps = [];
        var tempChart = new CanvasJS.Chart("tempChartContainer", {
            theme: "light2",
            title:{
                text:"Temperature"
            },
            animationEnabled: true,
            exportEnabled: true,
            axisX: {
                valueFormatString: "DD/MM/YY hh:mm:ss"      
            },
            axisY: {
                includeZero: false,
                suffix: "°C"
            },
            data: [{
                toolTipContent: "<b>{x}</b> : {y}°C",
                type: "spline",
                name : "Temperature (°C)",
                showInLegend: true,
                markerType: "square",
                dataPoints: tempData
            }]
        });

        var humChart = new CanvasJS.Chart("humChartContainer", {
            theme: "light2",
            title:{
                text:"Humidity"
            },
            animationEnabled: true,
            exportEnabled: true,
            axisX: {
                valueFormatString: "DD/MM/YY hh:mm:ss"      
            },
            axisY: {
                includeZero: false,
                suffix: "%"
            },
            data: [{
                lineColor: "green",
                toolTipContent: "<b>{x}</b> : {y}%",
                type: "spline",
                name : "Humidity (%)",
                showInLegend: true,
                //markerType: "square",
                dataPoints: humData
            }]
        });



        var latest = (new Date().setHours(0,0,0,0)).toString();
        
        
        let updateChart = function(){

            var current = (new Date().getTime()).toString();

            const URL = "/default/getSigfoxDataByDate";//?from=%22"+this.dayBegin+"%22&to=%22"+this.dayEnd+"%22";
            let params = new HttpParams();
            params = params.append('from', "\""+latest+"\"");//1551312000000 this.dayBegin latest
            params = params.append('to', "\""+current+"\"");//1551398399999 this.dayEnd current
 
            this.http.get(URL, {params: params})
                .toPromise()
                .then(response => {
                    var dataJSON = JSON.parse(JSON.stringify(response));
                    let bodyJSON = JSON.parse(dataJSON.body);
                    let ItemsArray = bodyJSON.Items;
                    //console.log(ItemsArray);

                    ItemsArray.forEach(function (aItem) {
                        let temp = parseInt(aItem.payload.temp,10)/10;
                        let hum = parseInt(aItem.payload.hum,10)/10;
                        let timestamp = parseInt(aItem.timestamp,10);
                        console.log(typeof timestamp);
                        tempData.push({ x: new Date(timestamp), y: temp });
                        humData.push({ x: new Date(timestamp), y: hum });
                        latest = (timestamp+1).toString();
                    }.bind(this));

                    tempChart.render();
                    humChart.render();
                })
                .catch(err=>{console.log(err);});
            }.bind(this);

            
            updateChart();
            let timer = setInterval(function(){
                updateChart();
            }.bind(this),10000);
            
            console.log(dps);

    }



/*

    geInittData() : Promise<any>{
        
        const URL = "/default/getSigfoxDataByDate";//?from=%22"+this.dayBegin+"%22&to=%22"+this.dayEnd+"%22";
        let params = new HttpParams();
        params = params.append('from', "\""+this.dayBegin+"\"");//1551312000000 this.dayBegin
        params = params.append('to', "\""+this.dayEnd+"\"");//1551398399999 this.dayEnd

        console.log(URL);
        return this.http.get(URL, {params: params})
            .toPromise()
            .then(response => {this.dataStr = JSON.stringify(response);})
            .catch(err=>{console.log(err);});
    }

    processInitData= () => {
        let dataJSON = JSON.parse(this.dataStr);
        let bodyJSON = JSON.parse(dataJSON.body);
        let ItemsArray = bodyJSON.Items;
        console.log(ItemsArray);

        ItemsArray.forEach(function (aItem) {
            let temp = parseInt(aItem.payload.temp,10)/10;
            let hum = parseInt(aItem.payload.hum,10)/10;
            let pres = parseInt(aItem.payload.pres,10)/10;
            let gas = parseInt(aItem.payload.gas,10)/10;
            let timestamp = parseInt(aItem.timestamp,10);
            console.log(typeof timestamp);
            this.tempData.push({ x: new Date(timestamp), y: temp });
            this.humData.push({ x: new Date(timestamp), y: hum });
            this.presData.push({ x: new Date(timestamp), y: pres });
            this.gasData.push({ x: new Date(timestamp), y: gas });
            this.latestDbTimestamp = timestamp+1;
        }.bind(this));

        this.tempData = this.tempData.reverse();
        this.humData = this.humData.reverse();
        this.presData = this.presData.reverse();
        this.gasData = this.gasData.reverse();
        // console.log(this.tempData);
    }

    getLatestData(): Promise<any>{
        const URL = "/default/getSigfoxDataByDate";//?from=%22"+this.dayBegin+"%22&to=%22"+this.dayEnd+"%22";
        let params = new HttpParams();
        params = params.append('from', "\""+this.latestDbTimestamp+"\"");
        params = params.append('to', "\""+new Date().getTime()+"\"");
    
        //TODO: CORS Problem need to be fix

        console.log(URL);
        return this.http.get(URL, {params: params})
            .toPromise()
            .then(response => {this.processLatestData(response)})
            .catch(err=>{console.log(err);});
    }

    processLatestData= (response) => {
        let dataJSON = JSON.parse(JSON.stringify(response));
        let bodyJSON = JSON.parse(dataJSON.body);
        console.log("found: "+bodyJSON.Count);
        if(bodyJSON.Count>0){
            let ItemsArray = bodyJSON.Items;
            for(let i=0;i<ItemsArray.length;i++){
                let temp = parseInt(ItemsArray[i].payload.temp,10)/10;
                let timestamp = parseInt(ItemsArray[i].timestamp,10);
                this.tempData.push({ x: new Date(timestamp), y: temp });

                console.log("new data @: "+ ItemsArray[i].timestamp);
                this.latestDbTimestamp = (parseInt(ItemsArray[i].timestamp,10)+1).toString();
            }
        }
        else{
            console.log("no new found");
        }
    }


    getWidth() : any {
        return '100%';
    }

    async ngAfterViewInit(): Promise<void> {
        // let data = this.myChart.source();

        let timer = setInterval(function(){
            this.getLatestData();
        }.bind(this),10000);
    }

    */
}


// setTimeout(function(){
        //     this.tempData = [//];
        //         {timestamp: "Thu Feb 28 2019 22:57:13 GMT+0000 (Greenwich Mean Time)", value: 20.8},
        //         {timestamp: "Thu Feb 28 2019 22:57:12 GMT+0000 (Greenwich Mean Time)", value: 20.8},
        //         {timestamp: "Thu Feb 28 2019 22:56:31 GMT+0000 (Greenwich Mean Time)", value: 20.8},
        //         {timestamp: "Thu Feb 28 2019 22:55:51 GMT+0000 (Greenwich Mean Time)", value: 20.8},
        //         {timestamp: "Thu Feb 28 2019 22:55:34 GMT+0000 (Greenwich Mean Time)", value: 20.8},
        //         {timestamp: "Thu Feb 28 2019 22:55:08 GMT+0000 (Greenwich Mean Time)", value: 20.8},
        //         {timestamp: "Thu Feb 28 2019 22:54:48 GMT+0000 (Greenwich Mean Time)", value: 20.8},
        //         {timestamp: "Thu Feb 28 2019 22:54:27 GMT+0000 (Greenwich Mean Time)", value: 20.8},
        //         {timestamp: "Thu Feb 28 2019 22:54:06 GMT+0000 (Greenwich Mean Time)", value: 20.8},
        //         {timestamp: "Thu Feb 28 2019 22:53:45 GMT+0000 (Greenwich Mean Time)", value: 20.8},
        //         {timestamp: "Thu Feb 28 2019 22:53:25 GMT+0000 (Greenwich Mean Time)", value: 20.8},
        //         {timestamp: "Thu Feb 28 2019 22:53:04 GMT+0000 (Greenwich Mean Time)", value: 20.8},
        //         {timestamp: "Thu Feb 28 2019 22:52:42 GMT+0000 (Greenwich Mean Time)", value: 20.8},
        //         {timestamp: "Thu Feb 28 2019 22:52:21 GMT+0000 (Greenwich Mean Time)", value: 20.8},
        //         {timestamp: "Thu Feb 28 2019 22:52:02 GMT+0000 (Greenwich Mean Time)", value: 20.8},
        //         {timestamp: "Thu Feb 28 2019 22:51:39 GMT+0000 (Greenwich Mean Time)", value: 20.9},
        //         {timestamp: "Thu Feb 28 2019 22:51:18 GMT+0000 (Greenwich Mean Time)", value: 20.9},
        //         {timestamp: "Thu Feb 28 2019 22:50:56 GMT+0000 (Greenwich Mean Time)", value: 20.9},
        //         {timestamp: "Thu Feb 28 2019 22:50:36 GMT+0000 (Greenwich Mean Time)", value: 20.9},
        //         {timestamp: "Thu Feb 28 2019 22:50:14 GMT+0000 (Greenwich Mean Time)", value: 20.9},
        //         {timestamp: "Thu Feb 28 2019 22:49:54 GMT+0000 (Greenwich Mean Time)", value: 20.9}];
        // }.bind(this),500);