<template lang="html">
  <section class="app-sidebar">
    <nav class="sidebar sidebar-offcanvas" id="sidebar">
      <ul v-if="role == 'ADMIN'" class="nav">
            <li class="nav-item nav-profile">
               <div class="nav-link">
                   <div class="profile-name">
                       <p class="name">{{this.user}}</p>
                       <p class="designation">API Key: {{this.key}}</p>
                   </div>
               </div>
           </li>
            <!--<li class="nav-item">-->
              <!--<router-link class="nav-link" to="/products">-->
                <!--<i class="menu-icon mdi mdi-television"></i>-->
                <!--<span class="menu-title">Products</span>-->
                <!--<i class="menu-arrow"></i>-->
              <!--</router-link>-->
            <!--</li>-->
            <li class="nav-item">
           <router-link class="nav-link" to="/">
                  <i class="menu-icon mdi mdi-television"></i>
                  <span class="menu-title">Task run</span>
                  <i class="menu-arrow"></i>
           </router-link>
        </li>
            <li class="nav-item">
          <router-link class="nav-link" to="/task-management">
            <i class="menu-icon mdi mdi-notification-clear-all"></i>
            <span class="menu-title">Task management</span>
            <i class="menu-arrow"></i>
          </router-link>
        </li>
            <li class="nav-item">
          <router-link class="nav-link" to="/users">
            <i class="menu-icon mdi mdi-account"></i>
            <span class="menu-title">Users</span>
            <i class="menu-arrow"></i>
          </router-link>
        </li>
      </ul>
      <ul v-else class="nav">
            <li class="nav-item nav-profile">
                <div class="nav-link">
                    <div class="profile-name">
                        <p class="name">{{this.user}}</p>
                        <p class="designation">API Key: {{this.key}}</p>
                    </div>
                </div>
            </li>
            <li class="nav-item">
                <router-link class="nav-link" to="/">
                    <i class="menu-icon mdi mdi-television"></i>
                    <span class="menu-title">Task run</span>
                    <i class="menu-arrow"></i>
                </router-link>
            </li>
            <!--<li class="nav-item">-->
                  <!--<router-link class="nav-link" to="/products">-->
                      <!--<i class="menu-icon mdi mdi-television"></i>-->
                      <!--<span class="menu-title">Products</span>-->
                      <!--<i class="menu-arrow"></i>-->
                  <!--</router-link>-->
            <!--</li>-->
        </ul>
      <button v-if="user !== 'superadmin'" @click="revokeApiKey" class="btn btn-block btn-primary btn-lg font-weight-medium w-75 app-sidebar--btn">Revoke API key</button>
      <button v-if="user !== 'superadmin'" @click="changePasswordModal" class="btn btn-block btn-primary btn-lg font-weight-medium w-75 app-sidebar--btn">Change password</button>
      <a class="swagger-logo" target="_blank" href="https://backendzenabi.dimatech.org/swagger-ui.html#/RestAPI"></a>
    </nav>
      <div id="changePasswordModal" class="pass-modal" ref="modal">
          <div class="pass-modal__content">
              <span class="close pass-modal__close" id="close">x</span>
              <div class="modal-body pass-modal__body">
                  <div class="form-group">
                      <div class="form-group">
                          <label>New Password</label>
                          <input type="password" minlength="7" maxlength="9" id="newPass" required class="form-control">
                          <a href="#" @click="showNewPass" id="showNewPass" class="mdi mdi-eye pass--btn"></a>
                      </div>
                      <div class="form-group">
                          <label>Confirm Password</label>
                          <input type="password" minlength="7" maxlength="9" id="confPass" required class="form-control">
                          <a href="#" @click="showConfPass" class="mdi mdi-eye pass--btn"></a>
                      </div>
                      <div id="AlertMSG" class="alert-danger"></div>
                  </div>
                  <div class="modal-footer pass-modal__footer">
                      <button type="submit" class="btn btn-primary" id="submitPassUpdate">Confirm</button>
                  </div>
              </div>
          </div>
      </div>
  </section>

</template>

<script lang="js">
export default {
  name: 'app-sidebar',
  data() {
    return {
        user: '',
        key: '',
        role: ''
    };
  },
  mounted() {
        if (localStorage.username) {
            this.user = localStorage.username;
        }
        if (localStorage.apiKey) {
            this.key = localStorage.apiKey;
        }
        if (localStorage.role) {
            this.role = localStorage.role;
        }
  },
  methods: {
      revokeApiKey: function () {
          let info = {};
          info["action"] = 'revokeToken';
          info['targetUsername'] = localStorage.getItem('username');
          let revokeRequest = new XMLHttpRequest();
          revokeRequest.onreadystatechange = function (v) {
              if (revokeRequest.readyState === 4) {
                  localStorage.setItem('apiKey', revokeRequest.response.apiKey);
                  v.key = localStorage.getItem('apiKey');
              }
          }.bind(revokeRequest, this);
          revokeRequest.open('PATCH', `${Host}/user`);
          revokeRequest.responseType = 'json';
          revokeRequest.setRequestHeader('Content-Type', 'application/json');
          revokeRequest.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
          revokeRequest.send(JSON.stringify(info));
      },
      changePasswordModal: function () {
          let modal = document.getElementById('changePasswordModal');
          let close = document.getElementById("close");
          let newPass = document.getElementById('newPass');
          let confPass = document.getElementById('confPass');
          let alert = document.getElementById('AlertMSG');
          let submit = document.getElementById('submitPassUpdate');

          alert.innerText = ' ';
          document.querySelectorAll('#newPass, #confPass').forEach(el=>el.value = '');

          modal.classList.remove('modal__close');
          modal.setAttribute("style", "z-index:9999; opacity: 1;");
          close.onclick = function() {
              modal.setAttribute("style", "z-index:-1; opacity: 0;");
          };
          window.onclick = function(event) {
              if (event.target == modal) {
                  modal.setAttribute("style", "z-index:-1; opacity: 0;");
              }
          };
          submit.onclick = function(v, event) {
              if (newPass.value == confPass.value) {
                  alert.innerText = ' ';
                  v.changePassword();
              } else {
                  event.preventDefault();
                  alert.innerText = 'Passwords do not match!';
              }
          }.bind(submit, this)
      },
      changePassword: function () {
          let paramsUser = {
              newPass: document.getElementById('newPass').value
          };
          let editInfo = {};
          editInfo["action"] = 'updateUser';
          editInfo['targetUsername'] = localStorage.getItem('username');
          editInfo['newPassword'] = paramsUser.newPass;
          let editRequest = new XMLHttpRequest();
          editRequest.onreadystatechange = function(v) {
              try {
                  if (editRequest.readyState === 4) {
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
                              v.$nextTick(() => {
                                  v.$refs.modal.classList.add('modal__close');
                                  v.$router.push({path: '/login'});
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
      showNewPass: function () {
          event.preventDefault();
          let newPass = document.getElementById('newPass');
          if (newPass.type === "password") {
              newPass.type = "text";
          } else {
              newPass.type = "password";
          }
      },
      showConfPass: function () {
          event.preventDefault();
          let newPass = document.getElementById('confPass');
          if (newPass.type === "password") {
              newPass.type = "text";
          } else {
              newPass.type = "password";
          }
      }
  }
}
</script>

<style scoped lang="scss">
  .app-sidebar {

    &--btn {
      margin-left: calc(25%/2);
      font-size: 0.85rem!important;
    }
  }
  .pass--btn {
      display: block;
      position: absolute;
      margin-top: -27px;
      right: 22px;
  }
  .swagger-logo{
        position: relative;
        float: left;
        width: 100%;
        height: 50px;
        margin: 60px 0;
        overflow: hidden;
        background-image: url('../assets/images/Swagger-logo.png');
        background-repeat: no-repeat;
        -webkit-background-size: contain;
        background-size: contain;
        background-position: center;

        img{
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    }
</style>
