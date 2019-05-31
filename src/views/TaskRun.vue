<template lang="html">
    <div class="container-scroller">
        <app-header/>
        <div class="container-fluid page-body-wrapper">
            <app-sidebar/>
            <div class="main-panel">
                <div class="content-wrapper">
                    <section v-if="!isProducts" class="dashboard" id="taskRun">
                        <div class="d-flex flex-wrap flex-row justify-content-between align-items-center w-100">
                            <div class="d-flex float-left" :span="10" style="margin-bottom: 10px">
                                <el-select v-model="filters[1].value"
                                           placeholder="Select all">
                                    <el-option label="Select all" value=""></el-option>
                                    <el-option label="www.revolve.com" value="www.revolve.com"></el-option>
                                    <el-option label="www.amazon.com" value="www.amazon.com"></el-option>
                                    <el-option label="www.ebay.com" value="www.ebay.com"></el-option>
                                </el-select>
                            </div>
                            <div id="showChart" class="d-flex float-right" :span="10" style="margin-bottom: 10px">
                                <a href="#" @click="showChart">Show Chart</a>
                            </div>
                        </div>
                        <data-tables-server
                                :data="tableData"
                                :table-props="tableProps"
                                :row-class-name="tableRowClassName"
                                :total="total"
                                :filters="filters"
                                v-loading="loading"
                                @query-change="reloadTasksData"
                                :pagination-props="{ pageSizes: [20, 50, 100] }">
                            <el-table-column
                                    prop="taskRunId"
                                    label="ID"
                                    custom
                                    width="300">
                                <template slot-scope="props">
                                    <a href="#" @click="showProducts(props.row.taskRunId)">{{ props.row.taskRunId }}</a>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    prop="startedAt"
                                    label="Started"
                                    width="300"
                                    sortable="custom">
                            </el-table-column>
                            <el-table-column
                                    prop="endedAt"
                                    label="Ended"
                                    width="300"
                                    sortable="custom">
                                <template slot-scope="props" >
                                    <span class="el-alert--error" v-if="props.row.endedAt !== 0 && props.row.count === 0 ">FAILED</span>
                                    <span v-if="props.row.endedAt !== 0 && props.row.count > 0 ">{{props.row.endedAt}}</span>
                                    <span v-if="props.row.endedAt === 0">IN PROGRESS</span>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    prop="count"
                                    label="Items"                                    >
                                <template slot-scope="props">
                                    <span>{{props.row.count}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    prop="website"
                                    label="Website">
                            </el-table-column>
                        </data-tables-server>
                    </section>
                    <div id="productsTable" v-if="isProducts = isProducts">
                        <div style="margin-bottom: 10px">
                            <a href="#" v-on:click="isProducts = !isProducts">Back to Tasks Runs</a>
                        </div>
                        <app-products v-bind:task-run-id="currentTaskRunId"></app-products>
                    </div>
                    <div v-if="isChart = isChart" v-loading="loading">
                        <div style="margin-bottom: 10px">
                            <a href="#" @click="backFromChart">Back to Tasks Runs</a>
                        </div>
                        <app-chart></app-chart>
                    </div>
                </div>
                <app-footer/>
            </div>
        </div>
    </div>
</template>

<script>
    import AppHeader from '../components/AppHeader'
    import AppSidebar from '../components/AppSidebar'
    import AppFooter from '../components/AppFooter'
    import AppProducts from '../components/AppProducts'
    import AppChart from "../components/AppChart";

    export default {
        name: "task-run",
        components: {
            AppChart,
            AppHeader,
            AppSidebar,
            AppFooter,
            AppProducts
        },
        data() {
            return {
                isProducts: false,
                isChart: false,
                currentTaskRunId: '',
                user: '',
                role: '',
                tableData: [],
                total: 0,
                filters: [
                    {
                        value: '',
                        search_prop: 'name'
                    },
                    {
                        value: [],
                    }
                ],
                tableProps: {
                    defaultSort: {
                        prop: 'startedAt',
                        order: 'descending'
                    }
                },
                loading: true
            }
        },
        mounted() {
            if (localStorage.username) {
                this.user = localStorage.username;
            }
            if (localStorage.role) {
                this.role = localStorage.role;
            }
            this.loadTasksData();
        },
        methods: {
            loadTasksData: function () {
                let datarequest = new XMLHttpRequest();
                datarequest.onreadystatechange = function(v) {
                    if (datarequest.readyState == 4) {
                        let dt = datarequest.response.data;
                        let options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
                        dt.forEach((item) => {
                            item.startedAt = new Date(item.startedAt).toLocaleDateString("en-US", options);
                            if ( item.endedAt !== 0 ) {
                                item.endedAt = new Date(item.endedAt).toLocaleDateString("en-US", options);
                            }
                        });
                        v.tableData = dt;
                        v.loading = false;
                    }
                }.bind(datarequest, this);//
                datarequest.open('GET', `${Host}/task-runs?limit=20&page=1&orderBy=startedAt&order=desc`);
                datarequest.responseType = 'json';
                datarequest.setRequestHeader('Content-Type', 'application/json');
                datarequest.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                datarequest.send();
            },
            reloadTasksData(queryInfo) {
                let refreshQuery = '';
                refreshQuery = refreshQuery + `limit=${queryInfo.pageSize}&page=${queryInfo.page}`;
                if (queryInfo.sort.prop !== null && typeof queryInfo.sort.prop !== 'undefined'){
                    refreshQuery = refreshQuery + `&orderBy=${queryInfo.sort.prop}&order=${queryInfo.sort.order === 'ascending' ? 'asc' : 'desc'}`;
                }
                if (queryInfo.filters[1].value !== '') {
                    refreshQuery = refreshQuery + `&website=${queryInfo.filters[1].value}`;
                }
                let refreshRequest = new XMLHttpRequest();
                refreshRequest.onreadystatechange =function (v) {
                    if (refreshRequest.readyState === 4) {
                        switch (refreshRequest.status) {
                            case (403):
                                localStorage.removeItem('token');
                                localStorage.removeItem('username');
                                localStorage.removeItem('apiKey');
                                localStorage.removeItem('role');
                                v.$router.push({ path: '/login' });
                                break;
                            case (400):
                                localStorage.removeItem('token');
                                localStorage.removeItem('username');
                                localStorage.removeItem('apiKey');
                                localStorage.removeItem('role');
                                v.$router.push({ path: '/login' });
                                break;
                            case (200):
                                let dt = refreshRequest.response.data;
                                let options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
                                dt.forEach((item) => {
                                    item.startedAt = new Date(item.startedAt).toLocaleDateString("en-US", options);
                                    // console.log(item.endedAt);
                                    if ( item.endedAt !== 0 ) {
                                        item.endedAt = new Date(item.endedAt).toLocaleDateString("en-US", options);
                                    }
                                });
                                v.tableData = dt;
                                v.total = queryInfo.pageSize * refreshRequest.response.pageCount;
                                v.loading = false;
                                break;
                            default:
                                localStorage.removeItem('token');
                                localStorage.removeItem('username');
                                localStorage.removeItem('apiKey');
                                localStorage.removeItem('role');
                                v.$router.push({ path: '/login' });
                        }
                    }
                }.bind(refreshRequest, this);
                refreshRequest.responseType = 'json';
                refreshRequest.open('GET', `${Host}/task-runs?${refreshQuery}`);
                refreshRequest.setRequestHeader('Content-Type', 'application/json');
                refreshRequest.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                refreshRequest.send();
                this.loading = true;

            },
            showProducts: function (id) {
                this.currentTaskRunId = id;
                this.isProducts = !this.isProducts;
            },
            showChart: function () {
                event.preventDefault();
                let wrapper = document.getElementById('taskRun');
                wrapper.setAttribute('style', 'display: none;');
                this.isChart = !this.isChart;
            },
            backFromChart:function () {
                event.preventDefault();
                let wrapper = document.getElementById('taskRun');
                wrapper.setAttribute('style', 'display: block;');
                this.isChart = !this.isChart;
            },
            tableRowClassName: function ({row, rowIndex}) {
                if (rowIndex === 1) {
                    return 'warning-row';
                } else if (rowIndex === 3) {
                    return 'success-row';
                }
                return '';
            },
        }
    }
</script>

<style scoped lang="scss">
    .el-table .warning-row {
        background: oldlace;
    }

    .el-table .success-row {
        background: #f0f9eb;
    }

</style>