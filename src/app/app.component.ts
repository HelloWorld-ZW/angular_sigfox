import { Component, ViewChild} from '@angular/core';
import { jqxChartComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxchart';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild('myChart') myChart: jqxChartComponent;

    constructor(private http: HttpClient){}
    
    private API_DEST:String = "https://uj7p7hp052.execute-api.eu-west-1.amazonaws.com/default";

    dataStr: String;

    dayBegin:string = (new Date().setHours(0,0,0,0)).toString(); //ms of dayBegin
    dayEnd:string = (new Date().setHours(23,59,59,999)).toString();;  //ms of dayEnd

    async ngOnInit(): Promise<void>{
        this.generateChartData();
        //this.showData();
        await this.getData();
        console.log(this.dayBegin, this.dayEnd);
    }

    getData() : Promise<any>{
        const URL = this.API_DEST+"/getSigfoxDataByDate";//?from=%22"+this.dayBegin+"%22&to=%22"+this.dayEnd+"%22";
        let params = new HttpParams();
        params = params.append('from', "\""+this.dayBegin+"\"");
        params = params.append('to', "\""+this.dayEnd+"\"");
        
        //TODO: CORS Problem need to be fix

        console.log(URL);
        return this.http.get(URL, {params: params})
            .toPromise()
            .then(response => {this.dataStr = JSON.stringify(response);})
            .catch(err=>{console.log(err);});
    }



    showData() {
        // this.getData().subscribe(data => {
        //     let max = 800;
        //     for(let i=0; i<data["Items"].length; i++){
        //         console.log(new Date(parseInt(data["Items"][i].timestamp).valueOf()));
        //         this.data.push({ timestamp: new Date(parseInt(data["Items"][i].timestamp).valueOf()), value: Math.max(100, (Math.random() * 1000) % max) });
        //     }
        //     this.dataset = JSON.stringify(data);
        //     this.data = this.data.reverse();
        // });
    }

    getWidth() : any {
        return '100%';
    }

    ngAfterViewInit(): void {
        let data = this.myChart.source();
        // let timer = setInterval(() => {
        //     let max = 800;
        //     if (data.length >= 60)
        //         data.splice(0, 1);
        //     let timestamp = new Date();
        //     timestamp.setSeconds(timestamp.getSeconds());
        //     timestamp.setMilliseconds(0);
        //     data.push({ timestamp: timestamp, value: Math.max(100, (Math.random() * 1000) % max) });
        //     this.myChart.update();
        // }, 1000);
    }

    data: any[] = [];

    // sigfox data sets
    tempData: any[] = [];
    humData: any[] = [];
    presData: any[] = [];
    gasData: any[] = [];


    padding: any = { left: 5, top: 5, right: 5, bottom: 5 };
    titlePadding: any = { left: 0, top: 0, right: 0, bottom: 10 };

    xAxis: any =
    {
        dataField: 'timestamp',
        type: 'date',
        baseUnit: 'second',
        unitInterval: 2,
        formatFunction: (value: any) => {
            return jqx.dataFormat.formatdate(value, 'hh:mm:ss', 'en-us');
        },
        gridLines: { step: 2 },
        valuesOnTicks: true,
        labels: { angle: -45, offset: { x: -17, y: 0 } }
    };

    valueAxis: any =
    {
        minValue: 0,
        maxValue: 1000,
        title: { text: 'Index Value' },
        labels: { horizontalAlignment: 'right' }
    };

    seriesGroups: any[] =
    [
        {
            type: 'line',
            columnsGapPercent: 50,
            alignEndPointsWithIntervals: true,
            valueAxis:
            {
                minValue: 0,
                maxValue: 1000,
                title: { text: 'Index Value' }
            },
            series: [
                { dataField: 'value', displayText: 'value', opacity: 1, lineWidth: 2, symbolType: 'circle', fillColorSymbolSelected: 'white', symbolSize: 4 }
            ]
        }
    ];

    colorsSchemesList: string[] = ['scheme01', 'scheme02', 'scheme03', 'scheme04', 'scheme05', 'scheme06', 'scheme07', 'scheme08'];

    seriesList: string[] = ['splinearea', 'spline', 'column', 'scatter', 'stackedcolumn', 'stackedsplinearea', 'stackedspline'];

    colorsOnChange(event: any): void {
        let value = event.args.item.value;
        this.myChart.colorScheme(value);
        this.myChart.update();
    }

    seriesOnChange(event: any): void {
        let args = event.args;
        if (args) {
            let value = args.item.value;
            this.myChart.seriesGroups()[0].type = value;
            this.myChart.update();
        }
    }

    generateChartData = () => {
        let max = 800;
        let timestamp = new Date();
        for (let i = 0; i < 30; i++) {
            timestamp.setMilliseconds(0);
            timestamp.setSeconds(timestamp.getSeconds() - 1);
            //console.log(timestamp.valueOf());
            this.data.push({ timestamp: new Date(timestamp.valueOf()), value: Math.max(100, (Math.random() * 1000) % max) });
        }
        this.data = this.data.reverse();
        console.log(this.data);
    }

    

}
