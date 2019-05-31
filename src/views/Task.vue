<template lang="html">
	<div class="container-scroller">
		<app-header/>
		<div class="container-fluid page-body-wrapper">
			<app-sidebar/>
			<div class="main-panel">
				<div class="content-wrapper">
					<section class="dashboard">
						<el-table
								:data="tableData"
								v-loading="loading"
								width="100%">
							<el-table-column
									prop="website"
									label="Website"
									width="280">
							</el-table-column>
							<el-table-column
									prop="schedule"
									label="Schedule">
								<template slot-scope="props">
									<span>{{props.row.schedule}}</span>
								</template>
							</el-table-column>
							<el-table-column
									prop="status"
									label="Status">
							</el-table-column>
							<el-table-column
									prop="limit"
									label="Limit">
							</el-table-column>
							<el-table-column
									prop="actions"
									label="Actions"
									width="200">
								<template slot-scope="props">
									<button class="btn btn-success" @click="showEditModal(props.row.website)">
										Edit
									</button>
								</template>
							</el-table-column>
						</el-table>
						<div id="taskModal" class="product-modal">
							<div class="product-modal__content">
								<span id="taskModalClose" class="close product-modal__close">x</span>
								<div id="result" class="modal-body product-modal__body">
									<div class="form-group">
										<div class="form-group">
											<div class="row">
												<div class="col-lg-4">
													<label>Schedule</label>
													<select id="editTaskSchedule" value="" class="form-control" required @change="changeDate($event)">
														<option  value="0 0 0/2 * * ?" id="2h">Every 2 Hours</option>
														<option value="0 0 0/4 * * ?" id="4h">Every 4 Hours</option>
														<option value="0 0 0/8 * * ?" id="8h">Every 8 Hours</option>
														<option value="0 0 0/12 * * ?" id="12h">Every 12 Hours</option>
														<option value="* * ?" id="d">Every 1 Day</option>
														<option value="? * 2" id="w">Every 1 Week</option>
														<option value="1 * ?" id="m">Every 1 Month</option>
													</select>
												</div>
												<div id="editTaskScheduleBox" class="col-lg-8" v-if="flag">
													<div class="row">
														<div class="col-lg-2 mt-4 pt-2 pl-4">
															<label>at</label>
														</div>
														<div class="col-lg-4 mt-4">
															<div class="form-control">
																<input id="editTaskScheduleHours" @input="maxLengthCheck()" v-on:keyup="isNumeric()" step="1" class="form-control__time" required type="number"  min="0" max="23" placeholder="HH">
																<span class="form-control__separator">:</span>
																<input id="editTaskScheduleMinutes" @input="maxLengthCheck()" v-on:keyup="isNumeric()" step="1" class="form-control__time" required type="number" min="0" max="59" placeholder="MM">
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div class="form-group">
											<label>Status</label>
											<select id="editTaskStatus" class="form-control" >
												<option value="ENABLED">ENABLED</option>
												<option value="DISABLED">DISABLED</option>
											</select>
										</div>
										<div class="form-group">
											<label>Limit</label>
											<input name="editTaskLimit" type="text" oninput="this.value=this.value.replace(/[^0-9]/g,'');" id="editTaskLimit" required class="form-control" min="0" step="1" pattern="[0-9]">
										</div>
										<div class="form-group">
											<div id="AlertMessage" class="alert-danger"></div>
										</div>
									</div>
									<div class="modal-footer product-modal__footer">
										<input type="submit" class="btn btn-primary" id="submitEditTask" value="Confirm">
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
	import AppHeader from '../components/AppHeader';
	import AppSidebar from '../components/AppSidebar';
	import AppFooter from '../components/AppFooter'

	export default {
		name: 'task',
		components: {
			AppHeader,
			AppSidebar,
			AppFooter
		},
		data() {
			return {
				tableData: [],
				loading: true,
				flag: false,
				schedule: '',
			}
		},
		mounted() {
			this.loadTaskData();
		},
		methods: {
			loadTaskData: function () {
				let datarequest = new XMLHttpRequest();
				datarequest.onreadystatechange = function(v) {
					if (datarequest.readyState == 4) {
						v.loading = false;
						v.dt = datarequest.response.data;
						v.dt.forEach((item) => {
							item.schedule;
							let scheduleArray = item.schedule.split(" ");
							let scheduleDay = scheduleArray[3] + " " + scheduleArray[4] + " " + scheduleArray[5];
							let scheduleTime = scheduleArray[0] + " " + scheduleArray[1] + " " + scheduleArray[2];
							let scheduleTotal = scheduleTime + ' ' + scheduleDay;

							console.log(datarequest.response.timezoneOffset);
							let offset = (new Date().getTimezoneOffset() / 60 * -1) - datarequest.response.timezoneOffset / 60;
							let curHours = parseInt(scheduleArray[2]);
							let hoursWithOffset;
							if (curHours + offset > 23) {
								hoursWithOffset = (curHours + offset) - 24;
							} else if (curHours + offset < 0) {
								hoursWithOffset = 24 + (curHours + offset);
							} else {
								hoursWithOffset = (curHours + offset);
							}
							let hoursWithOffsetStr = (hoursWithOffset < 10 ? `0${hoursWithOffset}` : hoursWithOffset);
							let minutesStr = (scheduleArray[1].length === 1 ? `0${scheduleArray[1]}` : scheduleArray[1]);
							switch (scheduleDay) {
								case("* * ?"):
									this.schedule = 'Every 1 Day' + ' at ' + hoursWithOffsetStr + ':' + minutesStr;
									item.schedule = this.schedule;
									break;
								case("? * 2"):
									this.schedule = 'Every 1 Week' + ' at ' + hoursWithOffsetStr + ':' + minutesStr;
									item.schedule = this.schedule;
									break;
								case("1 * ?"):
									this.schedule = 'Every 1 Month' + ' at ' + hoursWithOffsetStr + ':' + minutesStr;
									item.schedule = this.schedule;
									break;
							}
							switch (scheduleTotal) {
								case("0 0 0/2 * * ?"):
									this.schedule = 'Every 2 Hours';
									item.schedule = this.schedule;
									break;
							}
							switch (scheduleTime) {
								case("0 0 0/4"):
									this.schedule = 'Every 4 Hours';
									item.schedule = this.schedule;
									break;
								case("0 0 0/8"):
									this.schedule = 'Every 8 Hours';
									item.schedule = this.schedule;
									break;
								case("0 0 0/12"):
									this.schedule = 'Every 12 Hours';
									item.schedule = this.schedule;
									break;
							}
							v.tableData = v.dt;
						});
					}
				}.bind(datarequest, this);
				datarequest.open('GET', `${Host}/tasks`);
				datarequest.responseType = 'json';
				datarequest.setRequestHeader('Content-Type', 'application/json');
				datarequest.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
				datarequest.send();
			},
			showEditModal: function (edit) {
				let targetTask = this.tableData.find((item) => item.website === edit);
				let targetTaskIndex = this.tableData.findIndex((item) => item.website === edit);
				let modal = document.getElementById('taskModal');
				let close = document.getElementById("taskModalClose");
				let TaskStatus = document.getElementById('editTaskStatus');
				let TaskLimit = document.getElementById('editTaskLimit');
				let submit = document.getElementById('submitEditTask');
				let alert = document.getElementById('AlertMessage');

				let curSchedule = targetTask.schedule.split(' ');
				switch (curSchedule[2]) {
					case "Day":
						this.flag = true;
						document.getElementById('d').setAttribute("selected", "selected");
						break;
					case "Month":
						this.flag = true;
						document.getElementById('m').setAttribute("selected", "selected");
						break;
					case "Week":
						this.flag = true;
						document.getElementById('w').setAttribute("selected", "selected");
						break;
					case "Hours":
						this.flag = false;
						document.getElementById(`${curSchedule[1]}h`).setAttribute("selected", "selected");
						break;
				}
				TaskStatus.value = targetTask.status;
				TaskLimit.value = targetTask.limit;
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
					if(TaskLimit.value < 0 || TaskLimit.value.length == ' ') {
						alert.innerText = 'the limit number can not have a negative or empty value!';
					} else {
						alert.innerText = '';
						v.changeTask(targetTaskIndex);
						modal.setAttribute("style", "z-index:-1; opacity: 0;");
					}
				}.bind(submit, this)
			},
			changeTask: function (targetTaskIndex) {
				let taskParams = {
					schedule: document.getElementById('editTaskSchedule').value,
					status: document.getElementById('editTaskStatus').value,
					limit: document.getElementById('editTaskLimit').value
				};
				let taskScheduleHours = document.getElementById('editTaskScheduleHours');
				let taskScheduleMinutes = document.getElementById('editTaskScheduleMinutes');

				if ( !taskScheduleHours ) {
					taskParams.schedule = document.getElementById('editTaskSchedule').value;
				} else {
					let timeValueHours = taskScheduleHours.value;
					let timeValueMinutes = taskScheduleMinutes.value;
					if( timeValueHours.length != 1 && timeValueHours[0] == 0) {
						timeValueHours = timeValueHours.slice(1)
					}
					if (timeValueMinutes.length != 1 && timeValueMinutes[0] == 0) {
						timeValueMinutes = timeValueMinutes.slice(1);
					}
					if (!timeValueHours) {
						timeValueHours = 0
					}
					if (!timeValueMinutes) {
						timeValueMinutes = 0
					}
					let totalSchedule = 0 + " " + timeValueMinutes + " " + timeValueHours + " " + taskParams.schedule;
					taskParams.schedule = totalSchedule;
				}

				let editInfo = {};
				editInfo["action"] = 'updateTask';
				editInfo['targetWebsite'] = this.tableData[targetTaskIndex].website;
				editInfo['newSchedule'] = taskParams.schedule;
				editInfo['newStatus'] = taskParams.status;
				editInfo['newLimit'] = taskParams.limit;
				editInfo['timezoneOffset'] = new Date().getTimezoneOffset();
				let editRequest = new XMLHttpRequest();
				editRequest.onreadystatechange = function(v) {
					try {
						if (editRequest.readyState === 4) {
							v.tableData[targetTaskIndex].schedule = taskParams.schedule;
							v.tableData[targetTaskIndex].status = taskParams.status;
							v.tableData[targetTaskIndex].limit = taskParams.limit;
							v.loadTaskData(targetTaskIndex);
						}
					}
					catch (err) {
						console.log(err);
					}
				}.bind(editRequest, this);
				editRequest.responseType = 'json';
				editRequest.open('PATCH', `${Host}/tasks`);
				editRequest.setRequestHeader('Content-Type', 'application/json');
				editRequest.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
				editRequest.send(JSON.stringify(editInfo));
				this.loading = true;
			},
			maxLengthCheck: function () {
				let hour = document.getElementById('editTaskScheduleHours');
				let minute = document.getElementById('editTaskScheduleMinutes');
				if (hour.value.length > 2) {
					hour.value = hour.value.slice(0, hour.max.length)
				}
				if (minute.value.length > 2) {
					minute.value = minute.value.slice(0, minute.max.length)
				}
				if (hour.value > 23) {
					hour.value = 0
				}
				if (minute.value > 59) {
					minute.value = 0
				}
			},
			isNumeric: function (event) {
				let theEvent = event || window.event;
				let key = theEvent.keyCode || theEvent.which;
				key = String.fromCharCode (key);
				let regex = /[^0-9]/;
				if ( !regex.test(key) ) {
					theEvent.returnValue = false;
					if (theEvent.preventDefault) theEvent.preventDefault();
				}
			},
			changeDate: function (event) {
				console.log("tab");
				switch (event.target.value) {
					case("0 0 0/2 * * ?"):
						this.flag = false;
						break;
					case("0 0 0/4 * * ?"):
						this.flag = false;
						break;
					case("0 0 0/8 * * ?"):
						this.flag = false;
						break;
					case("0 0 0/12 * * ?"):
						this.flag = false;
						break;
					case("* * ?"):
						this.flag = true;
						break;
					case("? * 2"):
						this.flag = true;
						break;
					case("1 * ?"):
						this.flag = true;
						break;
					default:
						this.flag = false;
						break;
				}
			}
		}
	}
</script>