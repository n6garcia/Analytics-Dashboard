// window:load event for Javascript to run after HTML
// because this Javascript is injected into the document head
window.addEventListener('load', function() {
    // Javascript code to execute after DOM content

    fetch("https://noeldev.site/api/performance", {
        method : 'GET'
    }).then(response => response.json())
    .then(data => {
        console.log(data.length);
        console.log(data[0]);

        entries = data.length;
        vals = [];

        for (let i = 0; i < entries; i++) {
            vals.push(data[i].pageLoadms);
        }

        const loadConfig = {
            type: 'bar',
            title: {
                text: 'Load Times Bar Chart',
                fontSize: 24,
            },
            scaleX: {
                // set scale label
                label: {
                    text: 'Count (nth load)'
                },
            },
            scaleY: {
                // scale label with unicode character
                label: {
                    text: 'Load Time (ms)'
                }
            },
            plot: {

            },
            series: [{
                // plot 1 values, linear data
                values: vals,
                backgroundColor: '#4d80a6'
            }]
        };

        zingchart.render({
            id: 'myChart1',
            data: loadConfig,
            height: '100%',
            width: '100%'
        });

    });


    fetch("https://noeldev.site/api/static", {
        method : 'GET'
    }).then(response => response.json())
    .then(data => {
        // clean data
        console.log(data.length);
        console.log(data[0]);

        entries = data.length;

        strings = [];
        counts = [];

        for (let i = 0; i < entries; i++) {
            let agentStr = data[i].agentString;
            let isUnique = true;
            for (let j=0; j < strings.length; j++){
                if (strings[j] == agentStr){
                    isUnique = false;
                    counts[j]++;
                }
            }
            if (isUnique){ 
                strings.push(agentStr); 
                counts.push(1);
            }
        }

        console.log(strings);
        console.log(counts);

        seriesLi = [];

        for (let i = 0; i < strings.length; i++){
            seriesLi.push({
                values: [counts[i]],
                text: strings[i],
            });
        }

        const pieConfig = {
            type : 'pie',
            title : {
                text : 'Agent Strings',
                fontSize : 24
            },
            scaleR: {},
            plot: {
                tooltip: {
                    text: "%t: %v (%npv%)"
                }
            },
            series: seriesLi
        };
        
        zingchart.render({
            id: 'myChart2',
            data: pieConfig,
            height: '100%',
            width: '100%'
        });

    });


});