import numpy as np
import tensorflow as tf

print(list(range(54,56,2)))

x = './P_48/1493039349728_17_-study-where_to_find_morel_mushrooms_frames/1491424517116.png,1491424517116,0.10795624554157257,0.44805312156677246,0.11251288652420044,0.4276569187641144,0.4479166666666667,0.5622222222222222,273.26,139.76,269.69,166.86,271.42,192.98,276.19,219.38,286.85,243.13,304.20,262.66,326.35,277.64,351.40,283.56,375.83,280.08,397.79,267.30,415.61,249.74,428.02,227.53,435.95,201.88,440.68,175.96,440.65,148.77,427.20,123.87,416.03,115.32,396.72,114.44,381.08,117.31,293.74,116.91,306.95,109.53,326.94,110.69,342.51,115.22,302.98,140.11,318.63,133.57,334.90,141.25,318.30,145.07,319.09,139.14,414.80,146.10,400.49,138.00,383.47,143.86,399.66,149.47,399.10,143.44,360.80,135.24,341.06,170.58,332.23,182.93,338.82,192.56,358.55,195.63,376.76,194.49,384.12,185.84,377.07,172.51,360.55,158.15,345.99,186.43,371.57,187.97,323.55,224.94,335.55,217.38,348.20,214.17,356.06,216.35,364.03,214.96,374.94,219.45,384.18,227.97,376.44,235.42,366.71,239.89,353.98,240.86,340.85,238.69,330.67,233.16,339.71,226.82,354.61,228.99,368.85,228.17,369.65,224.64,355.42,223.59,340.26,223.17,360.14,180.06,309.59,135.34,328.15,135.79,327.01,143.77,309.87,143.36,409.14,140.70,390.82,139.24,391.10,147.20,408.00,148.66,'
y = x.split(',')
print(len(y))
clmTracker = y[8:len(y)-1]
print(clmTracker)
print(len(clmTracker))

print(x.split("/")[0])

#with open('/course/cs143/datasets/webgazer/framesdataset/train_1430_1.txt') as f:
#    trainPaths = f.readlines()

#pTrainPaths = list(map(lambda x: x.replace("\\", "/").replace("\n", ""), filter(lambda x: x.split("\\")[0] == 'P_' + str(1), trainPaths)))

#print(pTrainPaths)
#print('')
#print(y[0][1:])

z = np.zeros(10)

print(z)

print(z[1:2])

# state = tf.Variable(0, name="counter")

# one = tf.constant(1)
# new_value = tf.add(state, one)
# update = tf.assign(state, new_value)

# sess = tf.Session()

# for i in range(2):
	
# 	sess.run(tf.global_variables_initializer())
# 	print(sess.run(state))
# 	for _ in range(3):
# 		sess.run(update)
# 		print(sess.run(state))

hero = np.zeros([8, 1])

print(hero)

nero = np.ndarray.tolist(np.reshape(hero, [8]))

print(nero)