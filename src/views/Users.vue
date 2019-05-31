<template>
    <div class="container-scroller">
        <app-header/>
        <div class="container-fluid page-body-wrapper">
            <app-sidebar/>
            <div class="main-panel">
                <div class="content-wrapper">
                    <div class="row">
                        <div class="col-lg-12 grid-margin">
                            <div class="card">
                                <div class="card-body d-flex justify-content-center">
                                    <button class="btn btn-primary" @click="openUserModal">
                                        Create user
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-lg-12 grid-margin">
                            <div class="card">
                                <div class="card-body">
                                    <el-table id="table"
                                              :data="tableData"
                                              v-loading="loading"
                                              width="100%">
                                        <el-table-column
                                                prop="username"
                                                label="Username"
                                                custom
                                                width="280">
                                        </el-table-column>
                                        <el-table-column
                                                prop="role"
                                                label="Role"
                                                sortable>
                                        </el-table-column>
                                        <el-table-column
                                                prop="status"
                                                label="Status"
                                                sortable>
                                            <template slot-scope="props">
                                                <el-switch v-if="props.row.username !== 'superadmin' && props.row.username !== user" v-model="tableData[props.row.index].status"
                                                active-value="ENABLED"
                                                inactive-value="DISABLED"
                                                @change="changeStatus($event, props.row.username)"
												active-color="#13ce66"
												inactive-color="#ff4949">
                                                </el-switch>
                                            </template>
                                        </el-table-column>
                                        <el-table-column
                                                prop="actions"
                                                label="Actions"
                                                width="380">
                                            <template slot-scope="props" v-if="props.row.username !== 'superadmin' && props.row.username !== user">
                                                <el-button type="primary" @click="showEditModal(props.row.username)">
													Edit
                                                </el-button>
                                                <el-button type='primary' value="REVOKE TOKEN"
                                                        @click="revokeToken(props.row.username)"
                                                        v-if="props.row.username !== 'superadmin' && props.row.username !== user">Revoke Key
                                                </el-button>
                                                <el-button v-if="props.row.username !== user" type='danger'
                                                        @click="deleteUser(props.row.username)" class="btnDanger">Delete
                                                </el-button>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="userModal" class="product-modal" ref="modalUser">
                <div class="product-modal__content">
                    <span class="close product-modal__close" id="closeUser">x</span>
                    <div class="modal-body product-modal__body">
                        <form action="#" @submit.prevent="addUser" autocomplete="off" id="userForm">
                                <div class="form-group">
                                    <div id="AlertMessage" class="alert-danger text-center"></div>
                                    <label>Username</label>
                                    <input type="text" autocomplete="off" id="createUsername" v-model="username" required class="form-control">
                                </div>
                                <div class="form-group">
                                    <label>Password</label>
                                    <input type="password" autocomplete="off" id="createPassword" v-model="password" required class="form-control">
                                </div>
                                <div class="form-group">
                                    <label>Role</label>
                                    <select class="form-control" id="createRole" required v-model="role">
                                        <option value="ADMIN">Admin</option>
                                        <option value="USER">User</option>
                                    </select>
                                </div>
                                <div class="modal-footer modal__footer">
                                    <button type="submit" id="submitAddUser" class="btn btn-primary">Confirm</button>
                                </div>
                        </form>
                    </div>
                </div>
         </div>
            <div id="productModal" class="product-modal" ref="modal">
                <div class="product-modal__content">
                    <span class="close product-modal__close" id="closeEditModal">x</span>
                    <div class="modal-body product-modal__body">
                        <div id="result" class="form-group"></div>
                        <div class="modal-footer product-modal__footer">
                            <button type="submit" class="btn btn-primary" id="submitUserUpdate">Confirm</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
    import AppHeader from '../components/AppHeader'
    import AppSidebar from '../components/AppSidebar'
    import AppFooter from '../components/AppFooter'

    export default {
        name: "users",
        data() {
          return {
              user: '',
              columns: [
                  'username',
                  'role',
                  'status',
                  'actions'
              ],
              tableData: [],
              loading: true
          }
        },
        components: {
            AppHeader,
            AppSidebar,
            AppFooter
        },
        mounted() {
            if (localStorage.username) {
                this.user = localStorage.username;
            }
            this.loadUsers();
        },
        methods: {
            loadUsers(){
                let datarequest = new XMLHttpRequest();
                datarequest.onreadystatechange = function(v, changedUserIndex) {
                    if (datarequest.readyState == 4) {
                        switch (datarequest.status) {
                            case(403):
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
                                v.loading = false;
                                v.tableData = datarequest.response;
                                v.tableData.forEach((item, index) => {
                                    v.tableData[index].index = index;
                                });
                                break;
                            default:
                                localStorage.removeItem('token');
                                localStorage.removeItem('username');
                                localStorage.removeItem('apiKey');
                                localStorage.removeItem('role');
                                v.$router.push({ path: '/login' });
                        }
                    }
                }.bind(datarequest, this);
                datarequest.open('GET', `${Host}/user`);
                datarequest.responseType = 'json';
                datarequest.setRequestHeader('Content-Type', 'application/json');
                datarequest.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                datarequest.send();
                this.loading = true;
            },
            openUserModal: function () {
              let modal = document.getElementById('userModal');
              let close = document.getElementById('closeUser');
              let alert = document.getElementById('AlertMessage');
              let submitAddUser = document.getElementById('submitAddUser');
              submitAddUser.disabled = false;
              alert.innerText = " ";

              document.querySelectorAll('#createUsername, #createPassword, #createRole').forEach(el=>el.value = '');
              modal.classList.remove('modal__close');
              modal.setAttribute('style', 'z-index:9999; opacity: 1;');
              close.onclick = function () {
                  modal.setAttribute('style', 'z-index:-1; opacity: 0;');
              };
                window.onclick = function(event) {
                    if (event.target == modal) {
                        modal.setAttribute("style", "z-index:-1; opacity: 0;");
                    }
                };
            },
            addUser: function () {
                let newUser = {
                    username: this.username,
                    password: this.password,
                    role: this.role,
                    status: 'ENABLED'
                };
                let alert = document.getElementById('AlertMessage');
                let submitAddUser = document.getElementById('submitAddUser');
                submitAddUser.disabled = true;

                if ( this.tableData.find(curUser => curUser.username === newUser.username) ) {
                    alert.innerText = 'This user already exists';
                    submitAddUser.disabled = false;
                } else {
                    alert.innerText = ' ';
                }
                let myRequest = new XMLHttpRequest();
                myRequest.onreadystatechange = function(v) {
                    try {
                        if (myRequest.readyState == 4) {
                            switch (myRequest.status) {
                                case(403):
                                    submitAddUser.disabled = false;
                                    break;
                                case (400):
                                    submitAddUser.disabled = false;
                                    break;
                                case (200):
                                    alert.innerText = ' ';
                                    submitAddUser.disabled = true;
                                    v.$nextTick(() => {
                                        v.$refs.modalUser.classList.add('modal__close');
                                        v.tableData.push(newUser);
                                        v.loadUsers(newUser);
                                        v.$router.push({path: '/users'});
                                    });
                                    break;
                                default:
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('username');
                                    localStorage.removeItem('apiKey');
                                    localStorage.removeItem('role');
                                    v.$router.push({ path: '/login' });
                            }
                        }
                    }
                    catch (err) {
                        console.log(err);
                    }
                }.bind(myRequest, this);
                myRequest.responseType = 'json';
                myRequest.open('PUT', `${Host}/user`);
                myRequest.setRequestHeader('Content-Type', 'application/json');
                myRequest.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                myRequest.send(JSON.stringify(newUser));
            },
            deleteUser: function (user) {
                let deleteUser = this.tableData.find((item) => item.username === user);
                let deleteUserIndex = this.tableData.findIndex((item) => item.username === user);
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
                                        v.tableData[deleteUser] = reloadRequest.response;
                                        v.loadUsers(deleteUser);
                                    }
                                };
                                reloadRequest.responseType = 'json';
                                reloadRequest.open('GET', `${Host}/user`);
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
                deleteRequest.open('DELETE', `${Host}/user`);
                deleteRequest.setRequestHeader('Content-Type', 'application/json');
                deleteRequest.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                deleteRequest.send(JSON.stringify({username: deleteUser.username}));
                this.loading = true;
            },
            changeStatus: function (newStatus, targetUsername) {
                let changedUser = this.tableData.find((item) => item.username === targetUsername);
                let changedUserIndex = this.tableData.findIndex((item) => item.username === targetUsername);
                let val = newStatus;
                let info = {};
                info["action"] = 'updateUser';
                info['targetUsername'] = changedUser.username;
                if ("ENABLED" === val) {
                    info['newStatus'] = 'ENABLED';
                    let statusRequest = new XMLHttpRequest();
                    statusRequest.onreadystatechange = function (v) {
						console.log('D');
                        if (statusRequest.readyState == 4) {
                            switch (statusRequest.status) {
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
                                    v.tableData[changedUserIndex].status = 'ENABLED';
                                    console.log(v.tableData);
                                    break;
                                default:
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('username');
                                    localStorage.removeItem('apiKey');
                                    localStorage.removeItem('role');
                                    v.$router.push({ path: '/login' });
                            }
                        }
                    }.bind(statusRequest, this);
                    statusRequest.open('PATCH', `${Host}/user`);
                    statusRequest.responseType = 'json';
                    statusRequest.setRequestHeader('Content-Type', 'application/json');
                    statusRequest.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                    statusRequest.send(JSON.stringify(info))
                }
                if ("DISABLED" === val) {
                    info['newStatus'] = 'DISABLED';
                    let statusRequest = new XMLHttpRequest();
                    statusRequest.onreadystatechange = function (v) {
                        if (statusRequest.readyState == 4) {
                            switch (statusRequest.status) {
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
                                    v.tableData[changedUserIndex].status = 'DISABLED';
                                    console.log(v.tableData);
                                    break;
                                default:
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('username');
                                    localStorage.removeItem('apiKey');
                                    localStorage.removeItem('role');
                                    v.$router.push({ path: '/login' });
                            }
                        }
                    }.bind(statusRequest, this);
                    statusRequest.open('PATCH', `${Host}/user`);
                    statusRequest.responseType = 'json';
                    statusRequest.setRequestHeader('Content-Type', 'application/json');
                    statusRequest.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                    statusRequest.send(JSON.stringify(info))
                }
            },
            revokeToken: function(targetUsername) {
                let revokeTokenRequest = new XMLHttpRequest();
                let payload = {};
                payload['action'] = 'revokeToken';
                payload['targetUsername'] = targetUsername;
                revokeTokenRequest.onreadystatechange = function (v) {
                    if (revokeTokenRequest.readyState === 4) {
                        switch (revokeTokenRequest.status) {
                            case (200):
                                v.$notify({
                                   title: "Token has been revoked",
                                    type: "success",
                                    offset: 50
                                });
                        }
                    }
                }.bind(revokeTokenRequest,this);
                revokeTokenRequest.responseType = 'json';
                revokeTokenRequest.open('PATCH', `${Host}/user`);
                revokeTokenRequest.setRequestHeader("Authorization", `Bearer ${localStorage.getItem('token')}`);
                revokeTokenRequest.setRequestHeader("Content-Type", "application/json");
                revokeTokenRequest.send(JSON.stringify(payload));
            },
            showEditModal: function (edit) {
                let editUser = this.tableData.find((item) => item.username === edit);
                let targetUserIndex = this.tableData.findIndex((item) => item.username === edit);
                let modal = document.getElementById('productModal');
                let close = document.getElementById("closeEditModal");
                let submit = document.getElementById('submitUserUpdate');
                let result = document.getElementById('result');
                submit.disabled = false;

                if ( editUser.role != 'ADMIN' ) {
                    result.innerHTML = `<div class="form-group">
                                        <label>Username</label>
                                        <input type="text" value="${editUser.username}" id="editUsername" required class="form-control">
                                    </div>
                                    <div class="form-group"><label>Role</label>
                                        <select id="editUserRole" value="${editUser.role}" class="form-control" >
                                            <option value="ADMIN">Admin</option>
                                            <option selected value="USER">User</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                          <div class="form-group">
                                              <label>New Password</label>
                                              <input type="password" minlength="7" maxlength="9" id="editUserNewPass" required class="form-control">
                                              <a href="#" id="showUserNewPass" class="mdi mdi-eye pass--btn"></a>
                                          </div>
                                      </div>`;
                } else {
                    result.innerHTML = `<div class="form-group">
                                        <label>Username</label>
                                        <input type="text" value="${editUser.username}" id="editUsername" required class="form-control">
                                    </div>
                                    <div class="form-group"><label>Role</label>
                                        <select id="editUserRole" value="${editUser.role}" class="form-control" >
                                            <option selected value="ADMIN">Admin</option>
                                            <option value="USER">User</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                          <div class="form-group">
                                              <label>New Password</label>
                                              <input type="password" value="" minlength="7" maxlength="9" id="editUserNewPass" class="form-control">
                                              <a href="#" id="showUserNewPass" class="mdi mdi-eye pass--btn"></a>
                                          </div>
                                      </div>`;
                }

                modal.classList.remove('modal__close');
                modal.setAttribute("style", "z-index:9999; opacity: 1;");
                close.onclick = function() {
                    modal.setAttribute("style", "z-index:-1; opacity: 0;");
                    result.innerHTML = " ";
                };
                window.onclick = function(event) {
                    if (event.target == modal) {
                        modal.setAttribute("style", "z-index:-1; opacity: 0;");
                        result.innerHTML = " ";
                    }
                };
                let trigger = document.getElementById('showUserNewPass');
                let newPass = document.getElementById('editUserNewPass');
                trigger.onclick = function (event) {
                    event.preventDefault();
                    if (newPass.type === "password") {
                        newPass.type = "text";
                    } else {
                        newPass.type = "password";
                    }
                };
                submit.onclick = function(v, event) {
                    modal.setAttribute("style", "z-index:-1; opacity: 0;");
                    v.changeUser(targetUserIndex);
                    result.innerHTML = " ";
                }.bind(submit, this)
            },
            changeUser: function (targetUserIndex) {
                let paramsUser = {
                    username: document.getElementById('editUsername').value,
                    role:  document.getElementById('editUserRole').value,
                    newPass: document.getElementById('editUserNewPass').value
                };
                let editInfo = {};
                editInfo["action"] = 'updateUser';
                editInfo['targetUsername'] = this.tableData[targetUserIndex].username;
                editInfo['newUsername'] = paramsUser.username;
                editInfo['newRole'] = paramsUser.role;
                if ( paramsUser.newPass.length > 0 ) {
                    editInfo['newPassword'] = paramsUser.newPass;
                }
                let submit = document.getElementById('submitUserUpdate');
                submit.disabled = true;
                let editRequest = new XMLHttpRequest();
                editRequest.onreadystatechange = function(v) {
                    try {
                        if (editRequest.readyState == 4) {
                            switch (editRequest.status) {
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
                                    v.tableData[targetUserIndex].username = paramsUser.username;
                                    v.tableData[targetUserIndex].role = paramsUser.role;
                                    v.$nextTick(() => {
                                        v.$refs.modal.classList.add('modal__close');
                                        v.$router.push({path: '/users'});
                                    });
                                    break;
                                default:
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('username');
                                    localStorage.removeItem('apiKey');
                                    localStorage.removeItem('role');
                                    v.$router.push({ path: '/login' });
                            }
                        }
                    }
                    catch (err) {
                        console.log(err);
                    }
                }.bind(editRequest, this);
                editRequest.responseType = 'json';
                editRequest.open('PATCH', `${Host}/user`);
                editRequest.setRequestHeader('Content-Type', 'application/json');
                editRequest.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                editRequest.send(JSON.stringify(editInfo));
            },
        }
    }
</script>

<style scoped lang="scss">
    .modal__close{
        display: none;
    }
	.btnDanger {
		background-color: #ff4949;
	}
</style>