<template lang="html">
  <div class="container-scroller">
    <app-header/>
    <div class="container-fluid page-body-wrapper">
      <app-sidebar/>
      <div class="main-panel">
        <div class="content-wrapper">
          <section class="dashboard">
              <div style="margin-bottom: 10px">
                  <el-row>
                      <el-col :span="6">
                          <el-input placeholder="search" v-model="filters[0].value"></el-input>
                      </el-col>
                  </el-row>
              </div>
              <data-tables-server
                      :data="tableData"
                      :filters="filters"
                      :total="total"
                      @query-change="loadData"
                      :pagination-props="{ pageSizes: [5, 10, 15, 20] }">
                  <el-table-column
                          prop="productId"
                          label="ID"
                          custom
                          width="300">
                      <template slot-scope="props">
                          <a href="#" @click="showProductModal(props.row.productId)">{{ props.row.productId }}</a>
                      </template>

                  </el-table-column>
                  <el-table-column
                          prop="name"
                          label="Name"
                          sortable>
                  </el-table-column>
                  <el-table-column
                          prop="category"
                          label="Category"
                          sortable>
                  </el-table-column>
                  <el-table-column
                          prop="manufacturer"
                          label="Manufacturer"
                          sortable>
                  </el-table-column>
                  <el-table-column
                          prop="cost"
                          label="Cost"
                          sortable>
                      <template slot-scope="props">
                          <span>$ {{ props.row.cost }}</span>
                      </template>
                  </el-table-column>
                  <!--<el-table-column v-if="role !== 'USER'"-->
                          <!--prop="actions"-->
                          <!--label="Actions"-->
                          <!--width="120">-->
                      <!--<template slot-scope="props">-->
                          <!--<button  type='button' class='btn btn-danger' @click="deleteProduct(props.row.productId)">Delete</button>-->
                      <!--</template>-->
                  <!--</el-table-column>-->
              </data-tables-server>
              <div id="productModal" class="product-modal">
                    <div class="product-modal__content">
                        <span id="closeProductModal" class="close product-modal__close">x</span>
                        <div class="modal-body product-modal__body">
                            <div class="form-group">
                               <div class="product-modal__list" id="result"></div>
                            </div>
                        </div>
                    </div>
                </div>
          </section>
        </div>
        <app-footer/>
      </div>
    </div>
  </div>
</template>

<script lang="js">
    import AppHeader from '../components/AppHeader'
    import AppSidebar from '../components/AppSidebar'
    import AppFooter from '../components/AppFooter'

    export default {
        name: 'products',
        components: {
            AppHeader,
            AppSidebar,
            AppFooter
        },
        data() {
            return {
                user: '',
                role: '',
                tableData: [],
                filters: [
                    {
                        value: '',
                        search_prop: 'name'
                    }
                ],
                total: 0
            }
        },
        mounted() {
            if (localStorage.username) {
                this.user = localStorage.username;
            }
            if (localStorage.role) {
                this.role = localStorage.role;
            }
            this.loadProductsData();
        },
        methods: {
            loadProductsData: function () {
                let datarequest = new XMLHttpRequest();
                datarequest.onreadystatechange = function(v) {
                    if (datarequest.readyState == 4) {
                        switch (datarequest.status) {
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
                                v.tableData = datarequest.response.data;
                                v.total = datarequest.response.pageCount * 10;
                                break;
                            default:
                                localStorage.removeItem('token');
                                localStorage.removeItem('username');
                                localStorage.removeItem('apiKey');
                                localStorage.removeItem('role');
                                v.$router.push({ path: '/login' });
                        }
                    }
                }.bind(datarequest, this);//
                datarequest.open('GET', `${Host}/products?limit=10&page=1`);
                datarequest.responseType = 'json';
                datarequest.setRequestHeader('Content-Type', 'application/json');
                datarequest.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                datarequest.send();
            },
            showProductModal: function (id) {
                event.preventDefault();
                let modal = document.getElementById('productModal');
                let span = document.getElementById("closeProductModal");
                let product = this.tableData.find((item) => item.productId === id);
                let result = document.getElementById('result');
                let pics = [];
                product.pictures.forEach((pic) => pics.push(`<img src="${pic}">`));
                result.innerHTML = `<div class="product-modal__element"><label>Product Name:</label><span class="product-modal__element--name">${product.name}</span></div>
                                    <div class="product-modal__element"><label>Product Cost:</label><span class="product-modal__element--name">$ ${product.cost}</span></div>
                                    <div class="product-modal__element"><label>Product Category:</label><span class="product-modal__element--cat">${product.category}</span></div>
                                    <div class="product-modal__element"><label>Manufacturer:</label><span class="product-modal__element--cat">${product.manufacturer}</span></div>
                                    <div class="product-modal__element"><label></label><div class="product-modal__images">${pics}</div></div>`;
                modal.setAttribute("style", "z-index:9999; opacity: 1;");
                span.onclick = function() {
                    modal.setAttribute("style", "z-index:-1; opacity: 0;");
                    result.innerHTML = ' ';
                };
                window.onclick = function(event) {
                    if (event.target == modal) {
                        modal.setAttribute("style", "z-index:-1; opacity: 0;");
                        result.innerHTML = ' ';
                    }
                }
            },
            loadData(queryInfo) {
                    let refreshQuery = '';
                    refreshQuery = refreshQuery + `limit=${queryInfo.pageSize}&page=${queryInfo.page}`;
                    if (queryInfo.sort.prop !== null && typeof queryInfo.sort.prop !== 'undefined'){
                        refreshQuery = refreshQuery + `&orderBy=${queryInfo.sort.prop}&order=${queryInfo.sort.order === 'ascending' ? 'asc' : 'desc'}`;
                    }
                    if (queryInfo.filters[0].value !== '') {
                        refreshQuery = refreshQuery + `&search=${queryInfo.filters[0].value}`;
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
                                    v.tableData = refreshRequest.response.data;
                                    v.total = queryInfo.pageSize * refreshRequest.response.pageCount;
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
                    refreshRequest.open('GET', `${Host}/products?${refreshQuery}`);
                    refreshRequest.setRequestHeader('Content-Type', 'application/json');
                    refreshRequest.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                    refreshRequest.send();
            },
            deleteProduct: function (prodId) {
                let delProduct = this.tableData.find((item) => item.productId === prodId);
                // console.log(delProduct);
                let deleteRequest = new XMLHttpRequest();
                deleteRequest.onreadystatechange = function (v) {
                    if (deleteRequest.readyState == 4) {
                        switch (deleteRequest.status) {
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
                                let reloadRequest = new XMLHttpRequest();
                                reloadRequest.onreadystatechange = function () {
                                    if (reloadRequest.readyState == 4) {
                                        v.tableData = reloadRequest.response.data;
                                        v.total = reloadRequest.response.pageCount * 10;
                                    }
                                };
                                reloadRequest.open('GET', `${Host}/products?limit=10&page=1`);
                                reloadRequest.responseType = 'json';
                                reloadRequest.setRequestHeader('Content-Type', 'application/json');
                                reloadRequest.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                                reloadRequest.send();
                                break;
                            default:
                                localStorage.removeItem('token');
                                localStorage.removeItem('username');
                                localStorage.removeItem('apiKey');
                                localStorage.removeItem('role');
                                v.$router.push({ path: '/login' });
                        }
                    }
                }.bind(deleteRequest, this);
                deleteRequest.responseType = 'json';
                deleteRequest.open('DELETE', `${Host}/products/${delProduct.productId}`);
                deleteRequest.setRequestHeader('Content-Type', 'application/json');
                deleteRequest.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                deleteRequest.send();
            }
        }
    }
</script>

<style scoped lang="scss">

</style>
