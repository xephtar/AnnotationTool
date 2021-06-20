import './index.css';

import { TokenAnnotator } from "react-text-annotate";

import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import reportWebVitals from './reportWebVitals';
import Highlighter from "react-highlight-words";

const BASE_URL = "https://meta-analysis-api.herokuapp.com/"
const API_URL = "api/annotate-article/"
const UPDATE_URL = "api/articles/"

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
    articleNum: 0,
    page: 1,
    pathways: []
  };

  async componentDidMount() {
    const response = await axios.get(BASE_URL + API_URL);
    const json = await response.data.results;
    this.setState({ articles: json });
    await this.getData();
  }
  handleChange = newValue => {
    this.setState({ value: newValue });
  };

  handleTagChange = e => {
    this.setState({ tag: e.target.value });
  };

  async getData(){
    fetch('pathways.json'
    ,{
      headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }
    }
    )
    .then((response) => { 
      return response.json();
    }).then((res) => this.setState({pathways: res}))
  }

  async onclick(type){
    const article = this.state.articles[this.state.articleNum];

    const url = BASE_URL + UPDATE_URL + article.id + '/'

    for(var val in this.state.value){
      delete val.color
    }

    var a = {
      name: article.name,
      pub_date: article.pub_date,
      annotations: this.state.value
    }

    fetch(url,
      {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json',
              'Accept' : 'application/json',
          
              // Other possible headers
          },
          body: JSON.stringify(a)

      })
      .then(async () => {
        const response = await axios.get(BASE_URL + API_URL);
        const json = await response.data.results;
        this.setState({ articles: json, articleNum: this.state.articleNum + 1, value: [] }, window.location.reload);
      });

  };

  render() {
    return (
      <div style={{ padding: 24, fontFamily: "IBM Plex Sans" }}>
        <h1>Annotation Tool</h1>
        <div style={{ display: "flex"}} key={this.state.articleNum}>
        <Card v-if={this.state.pathways.length > 0 && this.state.articles[this.state.articleNum]?.abstract_text}>
            <h2>
              Highlighted Pathway Names in Article
            </h2>
            <i>If article's abstract includes pathway from our pathway dictionary, It will be highlighted. 
              You should annotate that highlighted part at middle section. 
              If there is no highlighted word, You should search the abstract text to find pathway for annotation.
            </i>
            <br/>
            <br/>
            <Highlighter
              style={{
                lineHeight: "2",
              }}
              searchWords={this.state.pathways}
              autoEscape={true}
              textToHighlight={this.state.articles[this.state.articleNum]?.abstract_text}
            />
          </Card>
          <Card key={this.state.articleNum}>
            <div style={{ display: "flex" }}>
              <div style={{ flex: "80%", display: "flex", flexDirection: "column"}}>
                <p><b>Title:</b> {this.state.articles[this.state.articleNum]?.name}</p>
                <p><b>Doi:</b> {this.state.articles[this.state.articleNum]?.doi}</p>
              </div>
              <div style={{ flex: "20%", display: "flex", justifyContent: "flex-end"}}>
                <input type='button' onClick={this.onclick.bind(this, 'add')} value="Save" style={{height: '50px', width: '50px'}}/>
              </div>
            </div>
            <select onChange={this.handleTagChange} value={this.state.tag}>
              <option value="PERSON">PATHWAY</option>
            </select>
            
            {this.state.articles.length > 0 ? (this.state.articles[this.state.articleNum]?.abstract_text ? (<TokenAnnotator
            style={{
              lineHeight: 2
            }}
            tokens={this.state.articles[this.state.articleNum]?.abstract_text.split(" ")}
            value={this.state.value}
            onChange={this.handleChange}
            getSpan={span => ({
              ...span,
              tag: this.state.tag,
              color: TAG_COLORS[this.state.tag]
            })}
            renderMark={props => 
              <mark
                key={props.key}
                onClick={() =>
                  props.onClick({
                    start: props.start,
                    end: props.end,
                    text: props.text,
                    tag: props.tag
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
            }
          />) : (<h4>There is no abstract text of this article</h4>)) : (<h4>There is no article</h4>)}
                       
          </Card>
          <Card>
            <h4>Current Value</h4>
            <pre>{JSON.stringify(this.state.value, null, 2)}</pre>
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
