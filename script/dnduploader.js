function dnduploader(options) {	
	/***********************************************
					Default settings
	************************************************/
	
	this.dropAreaSelector = '#dropzone';
	this.messageAreaSelector = '#dropzone_messages';
	this.files=[]; //where the file references are held
	this.action = '';//post action url
	this.async = false;//do XHR asynchronously
	this.onComplete = function(){};
	this.onFail = function(){};
	
	this.formData = new FormData();
	
	this.acceptedTypes= {
		'text/plain': true,
		'text/csv' : true,
		'application/rtf': true,
		'image/png': true,
		'image/jpeg': true,
		'image/gif': true,
		'application/pdf': true,
		'application/msword': true,
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
		'application/vnd.openxmlformats-officedocument.wordprocessingml.template': true,
		'application/vnd.ms-excel': true,
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true,
		'application/vnd.ms-powerpoint': true,
		'application/vnd.openxmlformats-officedocument.presentationml.presentation': true,
		'application/vnd.openxmlformats-officedocument.presentationml.template': true,
		'application/vnd.openxmlformats-officedocument.presentationml.slideshow': true,
		'application/zip': true
	};
	
	this.fileIcons = {
		'text/plain': 'txt',
		'text/csv': 'txt',
		'application/rtf': 'rtf',
		'image/png': 'png',
		'image/jpeg': 'jpg',
		'image/gif': 'gif',
		'application/pdf': 'pdf',
		'application/msword': 'doc',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'doc',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.template': 'doc',
		'application/vnd.ms-excel': 'xls',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xls',
		'application/vnd.ms-powerpoint': 'ppt',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'ppt',
		'application/vnd.openxmlformats-officedocument.presentationml.template': 'ppt',
		'application/vnd.openxmlformats-officedocument.presentationml.slideshow': 'ppt',
		'application/zip': 'zip',
		'default': 'gen'
	};
	
	/***********************************************
		Initialise the object with user settings
	************************************************/
	if(typeof options == 'object'){
		for(var field in options){
			this[field] = options[field];
		}
	}

	this.dropArea = $(this.dropAreaSelector)[0];
	this.messageArea = $(this.messageAreaSelector)[0];
	$(this.messageArea).slideUp(0);
	
	/***********************************************
				Reset
	 ************************************************/
	
	this.reset = function(){
		this.files=[];
		$('.fileBox').remove();
	}
	
	/***********************************************
				drag event handlers
	************************************************/
	
	var that = this;
	this.dropArea.ondragover = function () {this.className = 'hover'; return false; };
	this.dropArea.ondragend = function () {this.className = ''; return false; };
	this.dropArea.ondrop = function (event) {
		var invalidFiles = [];
		this.className = "";
		event.preventDefault && event.preventDefault();
		console.log(event.dataTransfer)
		for(var fileCount = 0; fileCount < event.dataTransfer.files.length; fileCount++){
			if (that.acceptedTypes[event.dataTransfer.files[fileCount].type] === true) {
				var icon = that.fileIcons[event.dataTransfer.files[fileCount].type];
				if(!icon){
					icon = that.fileIcons['default'];
				}
				
				var fileObj = document.createElement('div');	
				fileObj.setAttribute('class','fileBox')
				var imgObj = document.createElement('img');
				imgObj.setAttribute('src','images/fileicons/' + icon + '.png');
				imgObj.setAttribute('alt', event.dataTransfer.files[fileCount].name);
				var nameObj = document.createTextNode(event.dataTransfer.files[fileCount].name);
				fileObj.appendChild(imgObj);
				fileObj.appendChild(document.createElement('br'));
				fileObj.appendChild(nameObj);
				
				$('#spacer').after(fileObj);
			
				that.files.push(event.dataTransfer.files[fileCount]);
			}
			else{
				//display a message
				invalidFiles.push(event.dataTransfer.files[fileCount].name); 
			}
		}
		
		if(that.messageArea && invalidFiles.length){
			var ul = document.createElement('ul');
			var message  = 'The following files are of an unsupported type and were not added:';
		
			for(var invalidFile in invalidFiles){
				item = document.createElement('li');
				item.appendChild(document.createTextNode(invalidFiles[invalidFile]));
				ul.appendChild(item);
			}
			
			if($(that.messageArea).hasClass('open')){
				$(that.messageArea).removeClass('open');
				$(that.messageArea).slideUp(300,function(){
					that.messageArea.innerHTML = '';
					that.messageArea.appendChild(document.createTextNode(message));
					that.messageArea.appendChild(ul);
					$(that.messageArea).slideDown(500);
					$(that.messageArea).addClass('open');
				});
			}
			else{
				that.messageArea.appendChild(document.createTextNode(message));
				that.messageArea.appendChild(ul);
				$(that.messageArea).slideDown(500);
				$(that.messageArea).addClass('open');
			}
			setTimeout(closeMessageArea,15000);
		}
		return false;
	};
	
	function closeMessageArea(){
		$(that.messageArea).removeClass('open');
		$(that.messageArea).slideUp(300,function(){
			that.messageArea.innerHTML = '';
		});
	}
	
	/***********************************************
			Add additional form data
	 ************************************************/
	
	this.appendData = function(key,data){
		this.formData.append(key,data);
	}
	
	/***********************************************
					Post to server
	************************************************/

	this.send = function(){
		for (var i = 0; i < that.files.length; i++) {
			this.formData.append('file' + i, this.files[i]);
		}
		var d = new Date()
		var dateString = Date.UTC(d.getFullYear(),d.getMonth(),d.getDay(),d.getHours(),d.getMinutes(),d.getSeconds(),d.getMilliseconds());
		var randString = Math.floor((Math.random()*100000)+1);
		var uploadID = dateString + '_' + randString;

		this.formData.append('dndupload', dateString + '_' + randString);
		
		if(that.files.length > 0){
			// now post a new XHR request
			var xhr = new XMLHttpRequest();
			xhr.open('POST', that.action, that.async);
			xhr.onload = function () {
			if (xhr.status === 200) {
			    if(typeof that.onComplete == 'function'){
			    	that.onComplete(xhr,uploadID);
			    }
			  } else {
				  if(typeof that.onFail == 'function'){
					  that.onFail(xhr,uploadID);
				  }
			  }
			};
			
			if(typeof that.onProgress == 'function'){
				xhr.upload.onprogress = that.onProgress
				/*function (event) {
				if (event.lengthComputable) {
				    var complete = (event.loaded / event.total * 100 | 0);
				    progress.value = progress.innerHTML = complete;
				  }
				};*/
			}
			
			xhr.send(this.formData);
		}
		else{
			that.onComplete(null,'');
		}
	}
	
}