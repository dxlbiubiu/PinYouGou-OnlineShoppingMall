 //控制层 
app.controller('goodsController' ,function($scope,$controller,goodsService,itemCatService,typeTemplateService,uploadService){
	
	$controller('baseController',{$scope:$scope});//继承
	
    //读取列表数据绑定到表单中  
	$scope.findAll=function(){
		goodsService.findAll().success(
			function(response){
				$scope.list=response;
			}			
		);
	};
	
	//分页
	$scope.findPage=function(page,rows){			
		goodsService.findPage(page,rows).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	};
	
	//查询实体 
	$scope.findOne=function(id){				
		goodsService.findOne(id).success(
			function(response){
				$scope.entity= response;					
			}
		);				
	};
	
	//保存 
	$scope.save=function(){				
		var serviceObject;//服务层对象  				
		if($scope.entity.id!=null){//如果有ID
			serviceObject=goodsService.update( $scope.entity ); //修改  
		}else{
			serviceObject=goodsService.add( $scope.entity  );//增加 
		}				
		serviceObject.success(
			function(response){
				if(response.success){
					//重新查询 
		        	$scope.reloadList();//重新加载
				}else{
					alert(response.message);
				}
			}		
		);				
	};
	

	//add
    //保存
    $scope.add=function(){
    	$scope.entity.tbGoodsDesc.introduction = editor.html();
        goodsService.add( $scope.entity).success(
            function(response){
                if(response.success){
                    alert("添加成功");
					$scope.entity = {};
					editor.html("");
                }else{
                    alert(response.message);
                }
            }
        );
    };

	//批量删除 
	$scope.dele=function(){			
		//获取选中的复选框			
		goodsService.dele( $scope.selectIds ).success(
			function(response){
				if(response.success){
					$scope.reloadList();//刷新列表
					$scope.selectIds=[];
				}						
			}		
		);				
	};
	
	$scope.searchEntity={};//定义搜索对象 
	
	//搜索
	$scope.search=function(page,rows){			
		goodsService.search(page,rows,$scope.searchEntity).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	};

	//图片上传
    $scope.uploadFile = function () {
        uploadService.uploadFile().success(
            function (response) {
                if (response.success) {
                    $scope.image_entity.url = response.message;
                } else {
                    alert(response.message);
                }
        })
    };

    $scope.entity = {tbGoods:{},tbGoodsDesc:{itemImages:[],specificationItems:[]}};

    $scope.add_image_entity = function () {
        $scope.entity.tbGoodsDesc.itemImages.push($scope.image_entity);
    };

    $scope.remove_image_entity = function (index) {
        $scope.entity.tbGoodsDesc.itemImages.splice(index,1);
    };

    //读取一级分类
	$scope.selectItemCat1List = function () {
		itemCatService.findByParentId(0).success(
			function (response) {
				$scope.itemCat1List = response;
            }
		)
    };

    //读取二级分类下拉框
	$scope.$watch('entity.tbGoods.category1Id',function (newValue,oldValue) {
            itemCatService.findByParentId(newValue).success(
                function (response) {
                    $scope.itemCat2List = response;
                }
            )
    });

    //读取三级分类下拉框
    $scope.$watch('entity.tbGoods.category2Id',function (newValue,oldValue) {
        itemCatService.findByParentId(newValue).success(
            function (response) {
                $scope.itemCat3List = response;
            }
        )
    });

    //读取模板ID
    $scope.$watch('entity.tbGoods.category3Id',function (newValue,oldValue) {
        itemCatService.findOne(newValue).success(
            function (response) {
                $scope.entity.tbGoods.typeTemplateId = response.typeId;
            }
        )
    });

    //根据ID跟新品牌列表
	$scope.$watch('entity.tbGoods.typeTemplateId',function (newValue,oldValue) {
		typeTemplateService.findOne(newValue).success(
			function (response) {
				$scope.typeTemplate = response;//获取类型模板
				$scope.typeTemplate.brandIds = JSON.parse($scope.typeTemplate.brandIds);//品牌列表
                //根据模板ID 更新模板对象
                $scope.entity.tbGoodsDesc.customAttributeItems = JSON.parse($scope.typeTemplate.customAttributeItems);
            }
		);

		//查询规格列表
		typeTemplateService.findSpecList(newValue).success(
			function (response) {
				$scope.specList = response;
            }
		)
    });

	$scope.updateSpecAttribute = function ($event,name,value) {
		var object = $scope.searchObjectByKey($scope.entity.tbGoodsDesc.specificationItems,'attributeName',name);
		if (object != null) {
			if ($event.target.checked) {
                object.attributeValue.push(value);
			} else {//取消勾选
				object.attributeValue.splice(object.attributeValue.indexOf(value),1);
				//如果选项都取消，将记录移除
				if (object.attributeValue.length == 0) {
                    $scope.entity.tbGoodsDesc.specificationItems.splice(
                    	$scope.entity.tbGoodsDesc.specificationItems.indexOf(object),1);
				}
			}
		} else {
            $scope.entity.tbGoodsDesc.specificationItems.push(
                {"attributeName":name,"attributeValue":[value]});
		}
    };

    $scope.createItemList = function () {
        //列表初始化
        $scope.entity.tbItems = [{spec:{},price:0,num:99999,status:'0',isDefault:'0'}];

        var items = $scope.entity.tbGoodsDesc.specificationItems;

        for (var i=0; i<items.length; i++) {

            $scope.entity.tbItems = addColumn($scope.entity.tbItems,items[i].attributeName,items[i].attributeValue);

        }
    };
    
    addColumn = function (list,columnName,columnValues) {
        var newList = [];
        
        for (var i=0; i<list.length; i++) {
            var oldRow = list[i];
            for (var j=0; j<columnValues.length; j++) {
                var newRow = JSON.parse( JSON.stringify(oldRow) );
                newRow.spec[columnName] = columnValues[j];
                newList.push(newRow)
            }
        } 
        
        return newList;
    }

});	