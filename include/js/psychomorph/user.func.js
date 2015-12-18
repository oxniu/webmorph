//====================================
// !USER FUNCTIONS
//====================================

function loginGoogle(authResult) {
    growl(JSON.stringify(authResult));
}

function registerUser() {
    // register a new user
    $.ajax({
        url: 'scripts/userRegister',
        async: false,
        data: {
            email: $('#login_email').val(),
            //password: $('#login_password').val(),
            invite: $('#login_auth').val(),
            //login_keep: $('#login_keep').prop('checked'),
            firstname: $('#reg_firstname').val(),
            lastname: $('#reg_lastname').val(),
            org: $('#reg_org').val(),
            sex: $('input[name=reg_sex]').val(),
            research: $('#reg_use_research').prop('checked'),
            business: $('#reg_use_business').prop('checked'),
            school: $('#reg_use_school').prop('checked'),
            art: $('#reg_use_art').prop('checked'),
            personal: $('#reg_use_personal').prop('checked'),
        },
        success: function(data) {
            if (data.error) {
                $('#login_error').html(data.errorText);
                $('#login_email').focus().select();
            } else {
                $('#login_error').html("<li>Check your email for your password.</li>");
                $('#loginInterface .reg_item').hide();
                $('#loginInterface .login_item').show();
                $('#login_password').focus().select();
            }
        }
    });
}

function loginUser() {
	$('#footer').html('Checking Login Details...');
    if ($('#loginInterface .reg_item:visible').length) {
        $('#loginInterface .reg_item').hide();
        $('#loginInterface .login_item').show();
        $('#register-button').removeClass('ui-state-focus');
        $('#login-button').addClass('ui-state-focus');
        $('#loginBox thead th').html('Log in to access Psychomorph');
        return true;
    }
        
    // check validity
    var error = false;
    $('#login_error').html('');
    var regexEmail = new RegExp('^\S+\@\S+$');
    
    if ($('#login_email').val().length < 1) {
        error = true;
        $('#login_error').append('<li>Please fill in the email.</li>');
        $('#login_email').addClass('error').focus().select();
    //} else if (!regexEmail.test($('#login_email').val())) {
    //    error = true;
    //    $('#login_error').append('<li>This doesn\'t appear to be a valid email address.</li>');
    //    $('#login_email').addClass('error').focus().select();
    } else {
        $('#login_email').removeClass('error');
    }

    if ($('#login_password').val().length < 1) {
        error = true;
        $('#login_error').append("<li>Please fill in the password.");
        $('#login_password').addClass('error').focus().select();
    } else {
        $('#login_password').removeClass('error');
    }
    
    if (error) { return false; }
    
    $.ajax({
        url: 'scripts/userLogin',
        data: {
            email: $('#login_email').val(),
            password: $('#login_password').val(),
            login_keep: $('#login_keep').prop('checked')
        },
        success: function(data) {
            if (data.error) {
                $('#login_error').html(data.errorText);
                $('#footer').html('');
            } else {
                console.log('Logged in as user ' + data.user);
                //$('#loginBox').fadeOut(1000);
                $('#login_password').val('');
                
                //$('#showProjects').click();
                var $spinner = bodySpinner();
                $('.interface:visible').not('#projectInterface').hide('fade', {}, 300, function() { 
                    menubar('project');
                    $('#projectInterface').show('fade', 300, function() {}); 
                    prefGet();
                    projectList();
                    $spinner.remove();
                });
            }
        }
    });
}

function logoutUser() {
    $('<div />').html('Do you want to quit and logout?').dialog({
        title: "Logout",
        buttons: {
            Cancel: function() {
                $(this).dialog("close");
            },
            "Logout": function() {
                $.ajax({
                    url: 'scripts/userLogout',
                    success: function(data) {
                        PM.no_onbeforeunload = true;
                        location.reload(true);
                    }
                });
            }
        }
    });
}

function rgbToArray(rgb) { 
	if (typeof rgb !== 'string') return [127,127,127];
    return rgb.replace('rgb(', '').replace(')','').split(',');
}

function prefGet(callback) {  console.time('prefGet()');
	$('#footer').html('Loading Preferences...');
    $.ajax({
        url: 'scripts/userPrefGet',
        type: 'GET',
        async: false,
        success: function(data) {
            if (data.error) { return false; }
            
            PM.userid = data.user;
            $('#pref_email').val(data.prefs.email);
            $('#pref_firstname').val(data.prefs.firstname);
            $('#pref_lastname').val(data.prefs.lastname);
            $('#menu_username span').html(data.prefs.email);
            $('#pref_org').val(data.prefs.organisation);
            $('#pref_sex input[name=pref_sex][value=' + data.prefs.sex + ']').prop('checked', true);
            $('#pref_use_research').prop('checked', data.prefs.research==1);
            $('#pref_use_school').prop('checked', data.prefs.school==1);
            $('#pref_use_business').prop('checked', data.prefs.business==1);
            $('#pref_use_personal').prop('checked', data.prefs.personal==1);
            $('#pref_use_art').prop('checked', data.prefs.art==1);
        
            $('#texture').prop('checked', data.prefs.texture == 'true');
            $('#show_thumbs').prop('checked', data.prefs.show_thumbs == 'true').change();
            $('#batch_names').val(data.prefs.batch_names);
            $('#sample_contours').prop('checked', data.prefs.sample_contours == 'true');
            $('#username').html(data.prefs.email);
            $('#password').val('');
            $('#align_x1').val(data.prefs.align_x1);
            $('#align_y1').val(data.prefs.align_y1);
            $('#align_x2').val(data.prefs.align_x2);
            $('#align_y2').val(data.prefs.align_y2);
            $('#align_w').val(data.prefs.align_w);
            $('#align_h').val(data.prefs.align_h);
            $('#normalisation').val(data.prefs.normalisation);
            $('#warp').val(data.prefs.warp);
            $('#default_imageformat').val(data.prefs.default_imageformat);
            $('#default_line_width').val(data.prefs.default_line_width);
            $('#default_project').val(data.prefs.default_project);
            if (PM.project == null) { PM.project = data.prefs.default_project; }
            
            PM.default_line_color = data.prefs.line_color;
            $('#line_color').slider('values', rgbToArray(data.prefs.line_color));
            $('#cross_color').slider('values', rgbToArray(data.prefs.cross_color));
            $('#selcross_color').slider('values', rgbToArray(data.prefs.selcross_color));
            $('.mask_color').slider('values', rgbToArray(data.prefs.mask_color));
            
            $('#pref_theme').slider('value', data.prefs.theme);
            if (data.prefs.theme == 361) {
                $('body').addClass('dark');
            } else {
                $('body').removeClass('dark');
            }
            PM.blankBG = "url(/include/images/blankface.php?h="+data.prefs.theme+")";
			PM.blankImg = "/include/images/blankface.php?h="+data.prefs.theme;
            
            // preload new stylesheet to prevent flashing
            var newstylesheet = "/include/css/style.php?t=" + Date.now()
            $.ajax({
                url: newstylesheet, 
                type: 'GET',
                dataType: 'html',
                success: function(html) {
	                $('#page').hide();
                    $('#css').replaceWith("<link rel='stylesheet' type='text/css' href='" 
                            + newstylesheet + "' id='css' onload='$(\"#page\").show();' />");
                }
            });
            $('head > style').remove();
            
            var cc = rgbToArray(data.prefs.cross_color);
            var sc = rgbToArray(data.prefs.selcross_color)
            $('<style>.pt { background-image: url(/include/images/delin/cross.php?r=' + cc[0] + '&g=' + cc[1] + '&b=' + cc[2] + '); }'
            + '       .pt:hover, .pt.selected { background-image: url(/include/images/delin/cross.php?r=' + sc[0] + '&g=' + sc[1] + '&b=' + sc[2] + '); }'
            + '</style>').appendTo('head');
            
            // fm equations
            $('#fmButtons li').not('#fm_new, #fm_eyes, #fm_FWH').remove();    // clear all user equations
            $.each(data.fm, function(i, f) {
                var $newEQ = $('<li/>').attr({
                    'title': f.description,
                    'data-equation': f.equation,
                }).text(f.name);
                $('#fm_new').before($newEQ);
            });
            $('#fmButtons').sortable({
                items: 'li:not(#fm_new)',
                scope: 'fm',
                containment: '#facialmetricEQ'
            });
            
            if (data.prefs.pca == 1) {
                $('#singlePCA, #batchPCA, #PCvis').show().removeClass('disabled');
            } else {
                $('#singlePCA, #batchPCA, #PCvis').hide().addClass('disabled');
            }
            
            // default templates
            $('#default_template').html('');
            $('#currentTem').html('');
            $.each(data.default_templates, function(i, t) {
                var $opt = $('<option />').val(t.id)
                                          .html(t.name)
                                          .attr('title', t.notes)
                                          .attr('data-points', t.points)
                                          .attr('data-lines', t.lines);
                $('#default_template').append($opt);
                
                var $menuopt = $('<li />').addClass('delineate finder')
                                          .attr('title', t.notes)
                                          .attr('data-id', t.id)
                                          .attr('data-points', t.points)
                                          .attr('data-lines', t.lines)
                                          .html('<span class="checkmark">&nbsp;</span>' + t.name);
                $('#currentTem').append($menuopt);
                $menuopt.find('span.checkmark').hide();
            });
            $('#default_template').val(data.prefs.default_tem);
            if (PM.default_tem_id == 0) { setCurrentTem(data.prefs.default_tem); }
            drawTem();
        },
        complete: function() {
	        $('#footer').html('Preferences Loaded');
            console.timeEnd('prefGet()');
            callback;
        }
    });
}

function projectList() { console.time('projectList()');
	$('#footer').html('Loading Project List...');
    $.ajax({
        url: 'scripts/projListGet',
        type: 'GET',
        async: false,
        success: function(data) {
            if (data.error) { return false; }
            // add projects
            $('#project_list').hide().find('tbody').html('');
            $('#default_project').html('');
            $('#currentProject').html('');
            $.each(data.projects, function(i, p) {
                var $opt = $('<option />').val(p.id)
                                          .html(p.name)
                                          .attr('title', p.notes);
                $('#default_project').append($opt);
                
                var $menuopt = $('<li />').addClass('finder average transform project')
                                          .attr('title', p.notes)
                                          .attr('data-id', p.id)
                                          .html('<span class="checkmark">&nbsp;</span>' + p.name);
                $('#currentProject').append($menuopt);
                $menuopt.find('span.checkmark').hide();
                
                var owners = '<ul class="project_owners">';
                $.each(p.owners, function() {
                    owners += '<li title="' + this.email + '">';
                    owners += this.firstname + ' ' + this.lastname;
                    if (this.id == p.user_id) {
                        owners += ' *';
                    } else if (p.owners.length > 1) {
                        owners += ' <span data-id="'+ this.id +'" class="projectOwnerDelete" title="Remove">-</span>';
                    }
                    owners += '</li>';
                });
                owners += '</ul>';
                
                var tr = '<tr data-id="' + p.id + '"><td><a class="go_to_project">[Go]</a>'
                         + '</td><td>' + p.name 
                         + '</td><td>' + p.notes 
                         + '</td><td>' + (p.files - p.tmp) + ' files<br>' + p.size 
                         + '</td><td>' + owners + '</td></tr>';
                $('#project_list tbody').append(tr);
            });
            $('#project_list').show().stripe();
            
            
            // set up user list
            userlist = [];
            $.each(data.users, function(i, user) {
                userlist.push({
                    value: user.id, 
                    label: user.firstname + ' ' + user.lastname + ', ' + user.email,
                    name: user.lastname + ', ' + user.firstname,
                    email: user.email
                });
            });
            $('ul.project_owners').append('<li><input class="projectOwnerAdd" '
                                        + 'placeholder="Type Name to Add" /></li>');
                                        
            $('.projectOwnerAdd').autocomplete({
                source: userlist,
                focus: function( event, ui ) {
                    $(this).val(ui.item.label);
                    return false;
                },
                select: function( event, ui ) {
                    $(this).val(ui.item.label).data('id', ui.item.value);
                    return false;
                }
            }).autocomplete( "instance" )._renderItem = function( ul, item ) {
                return $( "<li>" ).append( item.name + "<br>&nbsp;&nbsp;<i>" + item.email + '</i>').appendTo( ul );
            };
                                        
            // set warning about total space allocation
            var ts = "Projects you own are using " + round(data.userAllocation.size/1024,1)
                   + " GB of your allocated " + round(data.userAllocation.allocation/1024,1) + " GB. ";
            if (data.userAllocation.size > data.userAllocation.allocation) {
                ts += "Please reduce your account by emptying the trash and/or removing files. "
                    + "After 1 January 2016, I will disable accounts that are over their space allocation.";
                $('#total_space').addClass('warning');
            } else {
                $('#total_space').removeClass('warning');
            }
            $('#total_space').html(ts);
        },
        complete: function() {
            console.timeEnd('projectList()');
            $('#footer').html('Project List Loaded');
        }
    });
}

function prefSet() {  console.log('prefSet()');
	$('#footer').html('Saving Preferences...');
    var prefData = {
        email: $('#pref_email').val(),
        password: $('#pref_password').val(),
        firstname: $('#pref_firstname').val(),
        lastname: $('#pref_lastname').val(),
        organisation: $('#pref_org').val(),
        sex: $('#pref_sex input[name=pref_sex]:checked').val(),
        research: $('#pref_use_research').prop('checked') ? 1 : 0,
        business: $('#pref_use_business').prop('checked') ? 1 : 0,
        school: $('#pref_use_school').prop('checked') ? 1 : 0,
        art: $('#pref_use_art').prop('checked') ? 1 : 0,
        personal: $('#pref_use_personal').prop('checked') ? 1 : 0,
        mask_color: $('#mask_color').slider('values'),
        cross_color: $('#cross_color').slider('values'),
        selcross_color: $('#selcross_color').slider('values'),
        line_color: $('#line_color').slider('values'),
        theme: $('#pref_theme').slider('value'),
        default_line_width: $('#default_line_width').val(),
        texture: $('#texture').prop('checked'),
        sample_contours: $('#sample_contours').prop('checked'),
        show_thumbs: $('#show_thumbs').prop('checked'),
        batch_names: $('#batch_names').val(),
        align_pt1: $('#align_pt1').val(),
        align_pt2: $('#align_pt2').val(),
        align_x1: $('#align_x1').val(),
        align_y1: $('#align_y1').val(),
        align_x2: $('#align_x2').val(),
        align_y2: $('#align_y2').val(),
        align_w: $('#align_w').val(),
        align_h: $('#align_h').val(),
        default_tem: $('#default_template').val(),
        normalisation: $('#normalisation').val(),
        warp: $('#warp').val(),
        default_imageformat: $('#default_imageformat').val(),
        default_project: $('#default_project').val()
    };
    
    $.ajax({
        url: 'scripts/userPrefSet',
        data: prefData,
        success: function(data) {
            if (data.error) {
                $('<div title="Error Saving Preferences" />').html(data.errorText).dialog();
            } else {
                $('#prefDialog').dialog("close");
                //growl('Preferences Saved', 1000);
            }
        },
        complete: function() {
	        $('#footer').html('Preferences Saved');
	    }
    });
}

function fmAddEquation() {
    // validate data
    var error = false;

    if ($('#fm_name').val() == '') {
        error = true;
        $('#fm_name').addClass('error').focus().select();
    } else {
        $('#fm_name').removeClass('error');
    }
    
    if ($('#fm_equation').val() == '') {
        error = true;
        $('#fm_equation').addClass('error').focus().select();
    } else {
        $('#fm_equation').removeClass('error');
    }
    
    if (!error) {
        $.ajax({
            url: "scripts/fmAddEquation",
            data: {
                name: $('#fm_name').val(),
                eq: $('#fm_equation').val(),
                desc: 'Description'
            },
            success: function(data) {
                var $newEQ = $('<li/>').attr({
                    'title': data.desc,
                    'data-equation': data.eq,
                }).text(data.name);
                $('#fmButtons').append($newEQ);
            }

        });
    }
}

function projectSet(id) {
    PM.project = id;
    loadFiles(PM.project);
    $('#currentProject li span.checkmark').hide();
    $('#currentProject li[data-id=' + id + '] span.checkmark').show();
}

function projectNew() {
    $('#newProjectDialog').dialog({
        title: 'New Project',
        buttons: {
            Cancel: function() {
                $(this).dialog("close");
            },
            'Save': {
                text: 'Save',
                class: 'ui-state-focus',
                click: function() {
                    $(this).dialog("close");
                    
                    var name = $('#new_project_name').val();
                    var notes = $('#new_project_notes').val();
                    $.ajax({
                        url: 'scripts/projNew',
                        data: {
                            name: name,
                            notes: notes
                        },
                        success: function(data) {
                            if (data.error) {
                                $('<div title="Error Creating Project" />').html(data.errorText).dialog();
                            } else {
                                PM.project = data.project;
                                projectList();
                                projectSet(PM.project);
                            }
                        }
                    });
                }
            }
        }
    });
}

function projectOwnerDeleteConfirmed(project, owner) { console.log('projectOwnerDeleteConfirmed('+project+', '+owner+')');
	$('#footer').html('Deleting Owner...');
    $.ajax({
        url: 'scripts/projOwnerDelete',
        data: {
            project: project,
            owner: owner
        },
        success: function(data) {
            if (data.error) {
                $('<div title="Error Deleting Owner" />').html(data.errorText).dialog();
                $('#footer').html('Owner Not Deleted');
            } else {
                $('#refresh').click();
                $('#footer').html('Owner Deleted');
            }
        }
    });
}

function projectOwnerDelete(project, owner) { console.log('projectOwnerDelete('+project+', '+owner+')');
    if (owner == PM.userid) {
        $('<div />').html("Are you sure you want to leave this project? You will not be able to undo this without having another owner re-add you.").dialog({
            title: 'Remove Yourself from Project',
            buttons: {
                Cancel: function() { $(this).dialog("close"); },
                "Leave Project": {
                    text: 'Leave Project',
                    click: function() {
                        $(this).dialog("close");
                        projectOwnerDeleteConfirmed(project, owner);
                    }
                }
            }
        });
    } else {
        projectOwnerDeleteConfirmed(project, owner);
    }
}

function projectEdit(td, category) {
	$('#footer').html('Editing Project...');
    var oldname = $(td).text();
    var w = $(td).width();
    var $newnameinput;
    
    if (category == "name") {
	    $newnameinput = $('<input />').val(oldname).attr('type', 'text').width(w);
	} else {
		$newnameinput = $('<textarea />').val(oldname).width(w).height($(td).height());
	}
    
    $newnameinput.keydown(function(e) {
        if (e.which == KEYCODE.enter) { 
	        e.stopPropagation();
	        $(this).blur(); 
	    }
    }).dblclick(function(e) {
	    e.stopPropagation();
    }).blur(function() {
        var newname = $(this).val();
        $(td).html(newname);
        
        if (newname !== '' && newname !== oldname) {
            $.ajax({
                url: 'scripts/projEdit',
                data: {
                    project: $(td).closest('tr').data('id'),
                    category: category,
                    newname: newname
                },
                success: function(data) {
                    if (data.error) {
                        growl(data.errorText);
                        $('#footer').html('Project Not Edited');
                    } else {
                        oldname = newname;
                        $('#footer').html('Project Edited');
                    }
                },
                complete: function() {
                    $(td).html(oldname);
                }
            });
        } else {
            $(td).html(oldname);
            $('#footer').html('');
        }
    }).focusout(function() {
	    $(this).blur(); 
    });
    
    $(td).html('').append($newnameinput);
    $newnameinput.focus().select();
}

function projectOwnerAdd(button) {
	$('#footer').html('Adding Project Owner...');
    var $input = $(button);
    var project = $input.closest('tr').data('id'); 
    
    var owner = $input.data('id');
    
    if (!(project > 0 && owner > 0)) { 
        
        $('#footer').html('User not found');
        $input.val('').focus();
        return false; 
    }
    
    $input.hide();
    
    $.ajax({
        url: 'scripts/projOwnerAdd',
        data: {
            project: project,
            owner: owner
        },
        success: function(data) {
            if (data.error) {
                $('<div title="Error Adding Owner" />').html(data.errorText).dialog();
                $('#footer').html('Project Owner Not Added');
                $input.show().val('');
            } else {
                $('#refresh').click();
                $('#footer').html('Project Owner Added');
            }
        }
    });
}