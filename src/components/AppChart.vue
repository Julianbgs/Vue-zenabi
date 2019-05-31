<template lang="html">
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg-12 grid-margin">
                <div class="row">
                    <div v-loading="loading" class="card w-100">
                        <div class="d-flex flex-wrap flex-row justify-content-between align-items-center w-100">
                            <div class="d-flex float-left" :span="10" style="margin-left: 15px; margin-top: 15px; margin-bottom: 10px;">
                                <el-select v-model="selected" @change="selectWeb()"
                                        placeholder="Select all">
                                    <el-option label="Select all" value="all"></el-option>
                                    <el-option label="www.revolve.com" value="www.revolve.com"></el-option>
                                    <el-option label="www.amazon.com" value="www.amazon.com"></el-option>
                                    <el-option label="www.ebay.com" value="www.ebay.com"></el-option>
                                </el-select>
                            </div>
                        </div>
                        <h3 class="card-title mb-4 text-center">Number of products</h3>
                        <canvas id="prodSuccessChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-12 grid-margin">
                <div class="row">
                    <div v-loading="loading" class="card w-100">
                        <h3 class="card-title mb-4 text-center mt-5">Time Spent on tasks (in hours)</h3>
                        <canvas id="prodTimeChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-12 grid-margin">
                <div class="row">
                    <div v-loading="loading" class="card w-100">
                        <h3 class="card-title mb-4 text-center mt-5">Number of failed tasks</h3>
                        <canvas id="prodFailedChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { Line } from 'vue-chartjs'

    export default {
        extends: Line,
        props: {
        },
        data() {
            return {
                loading: true,
                chartSuccessData: [],
                chartSuccessLabels: [],
                chartFailedData: [],
                chartFailedLabels: [],
                timeSpentLabels: [],
                timeSpentValues: [],
                selected: ''
            }
        },
        mounted () {
            this.loadSuccessChart();
            this.loadTimeSpentChart();
            this.loadFailedChart();
        },
        methods: {
            loadSuccessChart: async function () {
                // console.log('success');
                let tasksSuccessData = [];
                let tasksSuccessCount = [];
                let allTasks = new XMLHttpRequest();
                allTasks.onreadystatechange = function(v) {
                    if (allTasks.readyState == 4) {
                        let data = allTasks.response.data;
                        let options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
                        data.forEach((item) => {
                            item.startedAt = new Date(item.startedAt).toLocaleDateString("en-US", options);
                            tasksSuccessData.push(item.startedAt);
                            if(item.count > 0) {
                                tasksSuccessCount.push(item.count);
                            }
                        });
                        v.chartSuccessData = tasksSuccessCount;
                        v.chartSuccessLabels = tasksSuccessData;
                        let successChart = document.getElementById('prodSuccessChart');
                        let labels = v.chartSuccessLabels;
                        let items = v.chartSuccessData;
                        let succesChart = new Chart(successChart, {
                            type: 'line',
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: 'Number of products',
                                    data: items,
                                    backgroundColor: 'rgba(49,139,227,0.3)',
                                    borderColor: '#318be3',
                                    borderWidth: 3
                                }]
                            },
                            options: {
                                responsive: true,
                                loading: true,
                                lineTension: 1,
                                scales: {
                                    yAxes: [{
                                        ticks: {
                                            beginAtZero: true,
                                            padding: 25,
                                        }
                                    }]
                                }
                            }
                        });
                        v.loading = false;
                    }
                }.bind(allTasks, this);//
                allTasks.open('GET', `${Host}/task-runs?limit=200&page=1`);
                allTasks.responseType = 'json';
                allTasks.setRequestHeader('Content-Type', 'application/json');
                allTasks.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                allTasks.send();
                this.loading = true;
            },
            loadTimeSpentChart: async function () {
                let timeSpentValues = [];
                let timeSpentLabels = [];
                let allTasks = new XMLHttpRequest();
                allTasks.onreadystatechange = function(v) {
                    if (allTasks.readyState == 4) {
                        let data = allTasks.response.data;
                        let options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
                        data.forEach((item) => {
                            if (item.endedAt != 0) {
                                timeSpentValues.push(parseFloat((item.endedAt - item.startedAt) / 3600000).toFixed(2));
                                item.startedAt = new Date(item.startedAt).toLocaleDateString("en-US", options);
                                timeSpentLabels.push(item.startedAt);
                            }
                        });
                        v.timeSpentValues = timeSpentValues;
                        v.timeSpentLabels = timeSpentLabels;
                        let successChart = document.getElementById('prodTimeChart');
                        let labels = v.timeSpentLabels;
                        let items = v.timeSpentValues;
                        let succesChart = new Chart(successChart, {
                            type: 'line',
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: 'Task runtime (in hours)',
                                    data: items,
                                    backgroundColor: 'rgba(49,139,227,0.3)',
                                    borderColor: '#318be3',
                                    borderWidth: 3
                                }]
                            },
                            options: {
                                responsive: true,
                                loading: true,
                                lineTension: 1,
                                scales: {
                                    yAxes: [{
                                        ticks: {
                                            beginAtZero: true,
                                            padding: 25,
                                        }
                                    }]
                                }
                            }
                        });
                        v.loading = false;
                    }
                }.bind(allTasks, this);//
                allTasks.open('GET', `${Host}/task-runs?limit=200&page=1`);
                allTasks.responseType = 'json';
                allTasks.setRequestHeader('Content-Type', 'application/json');
                allTasks.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                allTasks.send();
                this.loading = true;
            },
            loadFailedChart: async function () {
                // console.log('Failed');
                let tasksFailedData = [];
                let tasksFailedCount = [];
                let allTasks = new XMLHttpRequest();
                allTasks.onreadystatechange = function(v) {
                    if (allTasks.readyState == 4) {
                        let data = allTasks.response.data;
                        let options = { year: 'numeric', month: 'long', day: 'numeric'};
                        data.forEach((item) => {
                            if (item.count === 0 && item.endedAt !== 0) {
                                let failedTasksLength = {
                                    count: 0
                                };
                                // console.log(failedTasksLength)
                                tasksFailedCount.push(Object.keys(failedTasksLength).length);
                                item.startedAt = new Date(item.startedAt).toLocaleDateString("en-US", options);
                                tasksFailedData.push(item.startedAt);
                            }
                        });
                        v.chartFailedData = tasksFailedCount;
                        v.chartFailedLabels = tasksFailedData;
                        let chart = document.getElementById('prodFailedChart');
                        let labels = v.chartFailedLabels;
                        let items = v.chartFailedData;

                        let myChart = new Chart(chart, {
                            type: 'line',
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: 'Number of failed tasks',
                                    data: items,
                                    backgroundColor: 'rgba(227,55,7,0.3)',
                                    borderColor: '#e33707',
                                    borderWidth: 3
                                }]
                            },
                            options: {
                                responsive: true,
                                loading: true,
                                lineTension: 1,
                                scales: {
                                    yAxes: [{
                                        ticks: {
                                            beginAtZero: true,
                                            padding: 25,
                                        }
                                    }]
                                }
                            }
                        });
                        v.loading = false;
                    }
                }.bind(allTasks, this);//
                allTasks.open('GET', `${Host}/task-runs?limit=200&page=1`);
                allTasks.responseType = 'json';
                allTasks.setRequestHeader('Content-Type', 'application/json');
                allTasks.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                allTasks.send();
                this.loading = true;
            },
            selectWeb: function () {
                let webValue = this.selected;
                if(webValue === 'all') {
                    webValue = 'www.revolve.com'
                }
                let refreshQuery = webValue;
                this.loading = true;

                let tasksSuccessData = [];
                let tasksSuccessCount = [];
                let allSuccessTasks = new XMLHttpRequest();
                allSuccessTasks.onreadystatechange = function(v) {
                    if (allSuccessTasks.readyState === 4) {
                        let data = allSuccessTasks.response.data;
                        let options = { year: 'numeric', month: 'long', day: 'numeric'};
                        data.forEach((item) => {
                            item.startedAt = new Date(item.startedAt).toLocaleDateString("en-US", options);
                            tasksSuccessData.push(item.startedAt);
                            if ( item.count > 0 && item.website === webValue) {
                                tasksSuccessCount.push(item.count);
                            }
                        });
                        v.chartSuccessData = tasksSuccessCount;
                        // console.log( v.chartData);
                        v.chartSuccessLabels = tasksSuccessData;

                        let chart = document.getElementById('prodSuccessChart');
                        let labels = v.chartSuccessLabels;
                        let items = v.chartSuccessData;
                        let myChart = new Chart(chart, {
                            type: 'line',
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: 'Number of products',
                                    data: items,
                                    backgroundColor: 'rgba(49,139,227,0.3)',
                                    borderColor: '#318be3',
                                    borderWidth: 3
                                }]
                            },
                            options: {
                                responsive: true,
                                loading: true,
                                lineTension: 1,
                                scales: {
                                    yAxes: [{
                                        ticks: {
                                            beginAtZero: true,
                                            padding: 25,
                                        }
                                    }]
                                }
                            }
                        });
                        v.loading = false;
                    }
                }.bind(allSuccessTasks, this);//
                allSuccessTasks.open('GET', `${Host}/task-runs?limit=200&page=1&website=${refreshQuery}`);
                allSuccessTasks.responseType = 'json';
                allSuccessTasks.setRequestHeader('Content-Type', 'application/json');
                allSuccessTasks.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                allSuccessTasks.send();

                let timeSpentValues = [];
                let timeSpentLabels = [];
                let allTasks = new XMLHttpRequest();
                allTasks.onreadystatechange = function(v) {
                    if (allTasks.readyState == 4) {
                        let data = allTasks.response.data;
                        let options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
                        data.forEach((item) => {
                            if (item.endedAt != 0 && item.website === webValue) {
                                timeSpentValues.push(parseFloat((item.endedAt - item.startedAt) / 3600000).toFixed(2));
                                item.startedAt = new Date(item.startedAt).toLocaleDateString("en-US", options);
                                timeSpentLabels.push(item.startedAt);
                            }
                        });
                        v.timeSpentValues = timeSpentValues;
                        v.timeSpentLabels = timeSpentLabels;
                        let successChart = document.getElementById('prodTimeChart');
                        let labels = v.timeSpentLabels;
                        let items = v.timeSpentValues;
                        let succesChart = new Chart(successChart, {
                            type: 'line',
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: 'Task runtime (in hours)',
                                    data: items,
                                    backgroundColor: 'rgba(49,139,227,0.3)',
                                    borderColor: '#318be3',
                                    borderWidth: 3
                                }]
                            },
                            options: {
                                responsive: true,
                                loading: true,
                                lineTension: 1,
                                scales: {
                                    yAxes: [{
                                        ticks: {
                                            beginAtZero: true,
                                            padding: 25,
                                        }
                                    }]
                                }
                            }
                        });
                        v.loading = false;
                    }
                }.bind(allTasks, this);//
                allTasks.open('GET', `${Host}/task-runs?limit=200&page=1`);
                allTasks.responseType = 'json';
                allTasks.setRequestHeader('Content-Type', 'application/json');
                allTasks.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                allTasks.send();
                this.loading = true;

                let tasksFailedData = [];
                let tasksFailedCount = [];
                let allFailedTasks = new XMLHttpRequest();
                allFailedTasks.onreadystatechange = function(v) {
                    if (allFailedTasks.readyState === 4) {
                        let data = allFailedTasks.response.data;
                        // console.log(data);
                        let options = { year: 'numeric', month: 'long', day: 'numeric'};
                        data.forEach((item) => {
                            item.startedAt = new Date(item.startedAt).toLocaleDateString("en-US", options);
                            tasksFailedData.push(item.startedAt);
                            if( item.count === 0 && item.endedAt !== 0 && item.website === webValue) {
                                let failedTasksLength = {
                                    count: 0
                                };
                                tasksFailedCount.push(Object.keys(failedTasksLength).length);
                            }
                        });
                        v.chartFailedData = tasksFailedCount;
                        // console.log(v.chartData);
                        v.chartFailedLabels = tasksFailedData;
                        let chart = document.getElementById('prodFailedChart');
                        let labels = v.chartFailedLabels;
                        let items = v.chartFailedData;
                        let myChart = new Chart(chart, {
                            type: 'line',
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: 'Number of failed tasks',
                                    data: items,
                                    backgroundColor: 'rgba(227,55,7,0.3)',
                                    borderColor: '#e33707',
                                    borderWidth: 3
                                }]
                            },
                            options: {
                                responsive: true,
                                loading: true,
                                lineTension: 1,
                                scales: {
                                    yAxes: [{
                                        ticks: {
                                            beginAtZero: true,
                                            padding: 25,
                                        }
                                    }]
                                }
                            }
                        });
                        v.loading = false;
                    }
                }.bind(allFailedTasks, this);//
                allFailedTasks.open('GET', `${Host}/task-runs?limit=200&page=1&website=${refreshQuery}`);
                allFailedTasks.responseType = 'json';
                allFailedTasks.setRequestHeader('Content-Type', 'application/json');
                allFailedTasks.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                allFailedTasks.send();
                this.loading = true;
            }
        }
    }
</script>

<style scoped>

</style>