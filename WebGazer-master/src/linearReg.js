'use strict';
(function(window) {
    
    window.webgazer = window.webgazer || {};
    webgazer.reg = webgazer.reg || {};
    webgazer.pupil = webgazer.pupil || {};

    /**
     * Constructor of LinearReg,
     * initialize array data
     * @constructor
     */
    webgazer.reg.LinearReg = function() {
        this.leftDatasetX = [];
        this.leftDatasetY = [];
        this.rightDatasetX = [];
        this.rightDatasetY = [];
        this.data = [];
    };

    /**
     * Add given data from eyes
     * @param {Object} eyes - eyes where extract data to add
     * @param {Object} screenPos - The current screen point
     * @param {Object} type - The type of performed action
     */
    webgazer.reg.LinearReg.prototype.addData = function(eyes, screenPos, type) {
        if (!eyes) {
            return;
        }
        webgazer.pupil.getPupils(eyes);
        if (!eyes.left.blink) {
            this.leftDatasetX.push([eyes.left.pupil[0][0], screenPos[0]]);
            this.leftDatasetY.push([eyes.left.pupil[0][1], screenPos[1]]);
        }

        if (!eyes.right.blink) {
            this.rightDatasetX.push([eyes.right.pupil[0][0], screenPos[0]]);
            this.rightDatasetY.push([eyes.right.pupil[0][1], screenPos[1]]);
        }
        this.data.push({'eyes': eyes, 'screenPos': screenPos, 'type': type});
    };

    /**
     * Add given data to current data set then,
     * replace current data member with given data
     * @param {Array.<Object>} data - The data to set
     */
    webgazer.reg.LinearReg.prototype.setData = function(data) {
        for (var i = 0; i < data.length; i++) {
            this.addData(data[i].eyes, data[i].screenPos, data[i].type);
        }
        this.data = data;
    };

    /**
     * Return the data
     * @returns {Array.<Object>|*}
     */
    webgazer.reg.LinearReg.prototype.getData = function() {
        return this.data;
    };

    /**
     * Calculate k random cluster centroids
     * @param k - the number of random clusters to generate
     * @param dataMin - The minimum data to run kmeans on
     * @param dataMax - The maximum data to run kmeans on
     * @returns {Array.Array} 2D array of k random cluster centroids
     */
    webgazer.reg.LinearReg.initializeMeans = function(k, dataMin, dataMax) {
        var means = [];
        for (var i = 0; i < k; i++) {
            var mean = [];
            for (var dim in dataMin) {
                mean[dim] = dataMin[dim] + Math.random() * (dataMax[dim] - dataMin[dim]);
            }
            means[i] = mean;
        }
        return means;
    };

    /**
     * Calculate k-means cluster assignemnts
     * @param k - the number of random clusters to generate
     * @param data - The data to run kmeans on
     * @returns {Array.Array} 2D array of the closest cluster centroids for each data point
     */
    webgazer.reg.LinearReg.kMeansCluster = function(k, data, means) {
        closestCentroids = [];
        for (var x in data) {
            var distances = [];
            for (var y in means) {
                var sum = 0;
                //Calculate euclidean distance between each data point and the cluster center
                for (var dim in data[x]) {
                    var diff = data[x][dim] - means[y][dim];
                    sum += Math.pow(diff, 2);
                }
                distances[y] = Math.sqrt(sum);
            }
            //Set the closest centroid for this data point to be the minimum distance
            //Where x is the index of the data point and closestCentroids[x] is the index of the cluster center
            closestCentroids[x] = distances.indexOf(Math.min.apply(Math, distances));
        }
        return closestCentroids
    };

    /**
     * Calculate k-means
     * @param k - the number of random clusters to generate
     * @param data - The data to run kmeans on
     * @returns {Array.Array} 2D array of k means
     */
    webgazer.reg.LinearReg.kMeans = function(k, data) {
        //calculate the data extremes
        var dataMin = [];
        var dataMax = [];
        for (var i in data) {
            for (var dim in data[i]) {
                if (!dataMin[dim]) {
                    dataMin[dim] = Number.MAX_VALUE;
                    dataMax[dim] = Number.MIN_VALUE;
                }
                if (data[i][dim] < dataMin[dim]) {
                    dataMin[dim] = data[i][dim];
                } 
                if (data[i][dim] < dataMax[dim]) {
                    dataMax[dim] = data[i][dim];
                }
            }
        }

        //initialize k random cluster centroids
        var means = webgazer.reg.LinearReg.initializeMeans(k, dataMin, dataMax);
        var closestCentroids = webgazer.reg.LinearReg.kMeansCluster(k, data, means);
        //Have our cluster centroids moved?
        var hasMoved = true;
        var iterations = 0;

        while (hasMoved && iterations < 10) {
            var dimensionSums = []; //sum of the data points dimensions
            var numDataPoints = []; //number of data points that we are averaging dimensions of
            for (var i in means) {
                numDataPoints[i] = 0;
                dimensionSums[i] = Array(means[i].length);
                for (var dim in means[i]) {
                    dimensionSums[i][dim] = 0;
                }
            }

            for (var i in closestCentroids) {
                var idx = closestCentroids[i];
                numDataPoints[idx]++;
                for (var dim in means[idx]) {
                    dimensionSums[idx][dim] += data[i][dim];
                }
            }

            for (var i in dimensionSums) {
                //If a mean has no points:
                if (numDataPoints[i] == 0) {
                    for (var dim in dataMin) {
                        dimensionSums[i][dim] = dataMin[dim] + Math.random() * (dataMax[dim] - dataMin[dim]);
                    }
                }
                //If a mean has points: 
                for (var dim in dimensionSums[i]) {
                    if (numDataPoints[i] != 0) {
                        dimensionSums[i][dim] /= numDataPoints[i];
                    }
                }
            }

            //check if the cluster centroids have moved:
            if (means.toString() == dimensionSums.toString()) {
                hasMoved = false;
            }

            means = dimensionSums;
            iterations++;
        }
        return means;
    };

    /**
     * Try to predict coordinates from pupil data
     * after apply linear regression on data set
     * @param {Object} eyesObj - The current user eyes object
     * @returns {Object}
     */
    webgazer.reg.LinearReg.prototype.predict = function(eyesObj) {
        if (!eyesObj) {
            return null;
        }

        //Before performing linear regression, we will cluster the data using k-means
        var numClusters = 5;
        var leftXKMeans = webgazer.reg.LinearReg.kMeans(numClusters, this.leftDatasetX);
        var leftYKMeans = webgazer.reg.LinearReg.kMeans(numClusters, this.leftDatasetY);
        var rightXKMeans = webgazer.reg.LinearReg.kMeans(numClusters, this.rightDatasetX);
        var rightYKMeans = webgazer.reg.LinearReg.kMeans(numClusters, this.rightDatasetY);

        //var result = regression('linear', this.leftDatasetX);
        var result = regression('linear', leftXKMeans);
        var leftSlopeX = result.equation[0];
        var leftIntersceptX = result.equation[1];

        //result = regression('linear', this.leftDatasetY);
        result = regression('linear', leftYKMeans);
        var leftSlopeY = result.equation[0];
        var leftIntersceptY = result.equation[1];

        //result = regression('linear', this.rightDatasetX);
        result = regression('linear', rightXKMeans);
        var rightSlopeX = result.equation[0];
        var rightIntersceptX = result.equation[1];

        //result = regression('linear', this.rightDatasetY);
        result = regression('linear', rightYKMeans);
        var rightSlopeY = result.equation[0];
        var rightIntersceptY = result.equation[1];
        
        webgazer.pupil.getPupils(eyesObj);

        if(!eyesObj.left.pupil || !eyesObj.right.pupil) {
            return null;
        }

        var leftPupilX = eyesObj.left.pupil[0][0];
        var leftPupilY = eyesObj.left.pupil[0][1];

        var rightPupilX = eyesObj.right.pupil[0][0];
        var rightPupilY = eyesObj.right.pupil[0][1];

        var predictedX = Math.floor((((leftSlopeX * leftPupilX) + leftIntersceptX) + ((rightSlopeX * rightPupilX) + rightIntersceptX))/2);
        var predictedY = Math.floor((((leftSlopeY * leftPupilY) + leftIntersceptY) + ((rightSlopeY * rightPupilY) + rightIntersceptY))/2);
        
        return {
            x: predictedX,
            y: predictedY
        };
    };

    /**
     * The LinearReg object name
     * @type {string}
     */
    webgazer.reg.LinearReg.prototype.name = 'simple';
    
}(window));
