import './index.css';

import { TextAnnotator, TokenAnnotator } from "react-text-annotate";

import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import reportWebVitals from './reportWebVitals';

const TEXT =
  "When Sebastian Thrun started working on self-driving cars at Google in 2007, few people outside of the company took him seriously. “I can tell you very senior CEOs of major American car companies would shake my hand and turn away because I wasn’t worth talking to,” said Thrun, now the co-founder and CEO of online higher education startup Udacity, in an interview with Recode earlier this week. A little less than a decade later, dozens of self-driving startups have cropped up while automakers around the world clamor, wallet in hand, to secure their place in the fast-moving world of fully automated transportation.";
const TAG_COLORS = {
  PATHWAY: "#84d2ff"
};

const Card = ({ children }) => (
  <div
    style={{
      boxShadow: "0 2px 4px rgba(0,0,0,.1)",
      margin: 6,
      flex: '50%',
      padding: 16
    }}
  >
    {children}
  </div>
);

class App extends React.Component {
  state = {
    value: [],
    tag: "PATHWAY",
    articles: [],
    articleNum: 0
  };

  async componentDidMount() {
    const response = await axios.get(`http://localhost:8000/api/articles/`);
    const json = await response.data.results;
    this.setState({ articles: json });
  }
  handleChange = newValue => {
    console.log(newValue)
    const lastItem = newValue[newValue.length - 1];
    if(lastItem){
      lastItem.articleNum = this.state.articleNum;
      delete lastItem.color;
    }
    this.setState({ value: newValue });
  };

  handleTagChange = e => {
    this.setState({ tag: e.target.value });
  };

  onclick(type){
    this.setState(prevState => {
       return {articleNum: type == 'add' ? prevState.articleNum + 1: prevState.articleNum - 1}
    });
}

  render() {
    return (
      <div style={{ padding: 24, fontFamily: "IBM Plex Sans" }}>
        <h1>Annotation Tool</h1>
        <div style={{ display: "flex"}}>
          <Card>
            <div style={{ display: "flex" }}>
              <div style={{ flex: "80%", display: "flex", flexDirection: "column"}}>
                <p><b>Title:</b> {this.state.articles[this.state.articleNum]?.name}</p>
                <p><b>Doi:</b> {this.state.articles[this.state.articleNum]?.doi}</p>
              </div>
              <div style={{ flex: "20%", display: "flex", justifyContent: "flex-end"}}>
                <input disabled={this.state.articleNum === 0} type='button' onClick={this.onclick.bind(this, 'sub')} value={String.fromCharCode(8592)} style={{height: '50px', width: '50px'}}/>
                <input disabled={this.state.articleNum === 99} type='button' onClick={this.onclick.bind(this, 'add')} value={String.fromCharCode(8594)} style={{height: '50px', width: '50px'}}/>
              </div>
            </div>
            <select onChange={this.handleTagChange} value={this.state.tag}>
              <option value="PERSON">PATHWAY</option>
            </select>
            
            {this.state.articles.length > 0 ? (this.state.articles[this.state.articleNum].abstract_text ? (<TokenAnnotator
            style={{
              lineHeight: 2
            }}
            tokens={this.state.articles[this.state.articleNum].abstract_text.split(" ")}
            value={this.state.value}
            onChange={this.handleChange}
            getSpan={span => ({
              ...span,
              tag: this.state.tag,
              color: TAG_COLORS[this.state.tag]
            })}
            renderMark={props => props.articleNum === this.state.articleNum && (
              <mark
                key={props.key}
                onClick={() =>
                  props.onClick({
                    start: props.start,
                    end: props.end,
                    text: props.text,
                    tag: props.tag,
                  })
                }
                style={{
                  padding: ".2em .3em",
                  margin: "0 .25em",
                  lineHeight: "1",
                  display: "inline-block",
                  borderRadius: ".25em",
                  background: TAG_COLORS[props.tag]
                }}
              >
                {props.content}{" "}
                <span
                  style={{
                    boxSizing: "border-box",
                    content: "attr(data-entity)",
                    fontSize: ".55em",
                    lineHeight: "1",
                    padding: ".35em .35em",
                    borderRadius: ".35em",
                    textTransform: "uppercase",
                    display: "inline-block",
                    verticalAlign: "middle",
                    margin: "0 0 .15rem .5rem",
                    background: "#fff",
                    fontWeight: "700"
                  }}
                >
                  {" "}
                  {props.tag}
                </span>
              </mark>
            )}
          />) : (<h4>There is no abstract text of this article</h4>)) : (<h4>There is no article</h4>)}
                       
          </Card>
          <Card>
            <h4>Current Value</h4>
            <pre>{JSON.stringify(this.state.value.filter(v => v.articleNum === this.state.articleNum), null, 2)}</pre>
          </Card>
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
