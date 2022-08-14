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
            vals.push([data[i].pageLoadStart,
                       data[i].pageLoadms]);
        }

        const loadConfig = {
            type: 'line',
            title: {
                text: 'Load Time Trend',
                fontSize: 24,
            },
            scaleX: {
                // set scale label
                label: {
                    text: 'Load Start (ms)'
                },
            },
            scaleY: {
                // scale label with unicode character
                label: {
                    text: 'Load Time (ms)'
                }
            },
            plot: {
                animation: {
                    effect: 'ANIMATION_EXPAND_BOTTOM',
                    method: 'ANIMATION_STRONG_EASE_OUT',
                    sequence: 'ANIMATION_NO_SEQUENCE',
                    speed: "ANIMATION_FAST",
                }
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

        loadConfig.type = 'scatter';
        loadConfig.title.text = 'Load Time Scatter'
        loadConfig.tooltip = {
            text: "%kt : %v",
        }

        zingchart.render({
            id: 'myChart2',
            data: loadConfig,
            height: '100%',
            width: '100%'
        });

    });



});