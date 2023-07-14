type BodyProps={
  body:string;
  setBody:(body:string)=>void;
}
const Body = ({body, setBody}:BodyProps) => {
  return <div className="headerBody">
    <h4 className="title">Body</h4>
    <textarea name="body" id="body" className="textarea"  rows={3} value={body} onChange={(e)=>setBody(e.target.value)}/>
  </div>
};
export default Body;