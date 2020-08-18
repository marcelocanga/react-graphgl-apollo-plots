import React, { Fragment, useEffect } from "react";
import { createClient, Provider, useQuery } from "urql";
import { useDispatch, useSelector } from "react-redux";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend, Label,Tooltip
} from "recharts";
import moment from "moment";
import * as actions from '../store/actions';


const client = createClient({
  url: "https://react.eogresources.com/graphql"
});
const query = `
query($input: [MeasurementQuery]) {
  getMultipleMeasurements(input: $input) {
    metric
    measurements {
      metric
      at
      value
      unit
    }
  }
}
`;

const getMetricNames = state => {
  const { metricNames } = state.metricNames;
  return {
    metricNames
  };
};
const getHeartBeat = state => {
  const { heartBeat } = state.heartBeat;
  return {
    heartBeat
  };
};

export default () => {
  return (
    <Provider value={client}>
      <Chart />
    </Provider>
  );
};

const Chart = () => {
//-------------------------------------- select/dispatch
  const { metricNames } = useSelector(getMetricNames);
  const { heartBeat }   = useSelector(getHeartBeat);
  const dispatch = useDispatch();

//-------------------------------------- hook state

  //const [newData, setNewData] = React.useState([]);
  //const [merged, setMerged]   = React.useState([]);
  const [odata,  setOdata]    = React.useState([]);

  const updatedMetricNames = metricNames
    ? metricNames.map(item => {
        item.after = heartBeat - 1800000;
        return item;
      })
    : null;

  
//--------------------------------------  query

    const [result, executeQuery] = useQuery({
    query,
    skip: !updatedMetricNames,
    variables: {
      input: updatedMetricNames ? updatedMetricNames : metricNames
    }
  });

  // const [result, executeQuery] = useQuery({
  //   query,
  //   variables: {
  //     input: metricNames
  //   }
  // });

  const { data, error } = result;

  //-------------------------------------- hook  effect
  useEffect(() => {
    //setNewData([]);
    setOdata([]);
    if (error) {
      dispatch({ type: actions.API_ERROR, error: error.message });
      return;
    }
    if (!data) return;
   
    // data.getMultipleMeasurements.map(item => {
    //   return newData.push(item.measurements);
    // });
    // console.log("measure:",data.getMultipleMeasurements);  
    
    // let merged = [].concat.apply([], newData);
    // merged.map(item => {
    //   item[item.metric] = item.value;
    //   return item;
    // });
    // setMerged(merged);

    let odata = [];
    let omea = data.getMultipleMeasurements;

    let jlen = omea[0].measurements.length;
    for(let jj=0; jj<jlen; jj++){
      let obj = {};
      obj["at"] = omea[0].measurements[jj].at ;
      for(let ii=0; ii < omea.length; ii++){
          obj[omea[ii].measurements[jj].metric] = omea[ii].measurements[jj].value;
      }
      odata.push(obj)
    }
    setOdata(odata);


  //   const interval = setInterval(() => {
  //     executeQuery({ requestPolicy: "network-only" });
  //     setMerged(merged);
  // }, 3000);

  }, 
  [dispatch, data, error, executeQuery]
  );

  //-------------------------------------- time formatter

  let xAxisTickFormatter = date => {
    return moment(parseInt(date)).format("LT");
  };

  

  return (
    <Fragment>
      <ResponsiveContainer width="100%" maxHeight={500}>
        <LineChart
          height={600}
          data={odata}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="at"
            tickFormatter={xAxisTickFormatter}
          />
          <YAxis yAxisId="F">
            <Label
              value="F"
              offset={15}
              position="bottom"
              style={{ textAnchor: "middle" }}
            />
          </YAxis>
          <YAxis yAxisId="PSI" orientation="left">
            <Label
              value="PSI"
              offset={15}
              position="bottom"
              style={{ textAnchor: "middle" }}
            />
          </YAxis>
          <YAxis yAxisId="%" orientation="left">
            <Label
              value="%"
              offset={15}
              position="bottom"
              style={{ textAnchor: "middle" }}
            />
          </YAxis>
          <Tooltip active={true}  labelFormatter={xAxisTickFormatter} />
          <Legend />
          {metricNames
            ? metricNames.map((metricName, index) => {
                let yID;
                if (
                  metricName.metricName === "tubingPressure" ||
                  metricName.metricName === "casingPressure"
                ) {
                  yID = "PSI";
                  return (
                    <Line
                      key={index}
                      yAxisId={yID}
                      type="linear"
                      xAxisID="at"
                      name={metricName.metricName}
                      dataKey={metricName.metricName}
                      stroke={
                        "#" + (((1 << 24) * Math.random()) | 0).toString(16)
                      }
                      activeDot={{ r: 5 }}
                      dot={false}
                    />
                  );
                } else if (
                  metricName.metricName === "oilTemp" ||
                  metricName.metricName === "flareTemp" ||
                  metricName.metricName === "waterTemp"
                ) {
                  yID = "F";
                  return (
                    <Line
                      key={index}
                      yAxisId={yID}
                      type="linear"
                      xAxisID="at"
                      name={metricName.metricName}
                      dataKey={metricName.metricName}
                      stroke={
                        "#" + (((1 << 24) * Math.random()) | 0).toString(16)
                      }
                      activeDot={{ r: 5 }}
                      dot={false}
                    />
                  );
                } else if (metricName.metricName === "injValveOpen") {
                  yID = "%";
                  return (
                    <Line
                      key={index}
                      yAxisId={yID}
                      type="linear"
                      xAxisID="at"
                      name={metricName.metricName}
                      dataKey={metricName.metricName}
                      stroke={
                        "#" + (((1 << 24) * Math.random()) | 0).toString(16)
                      }
                      activeDot={{ r: 5 }}
                      dot={false}
                    />
                  );
                }
              return 0;})
            : null}
        </LineChart>
      </ResponsiveContainer>
    </Fragment>
  );
};

