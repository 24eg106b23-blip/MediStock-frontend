import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import axios from 'axios';
import './style.css';

const API='http://localhost:8080/api/medicines';

function App(){
 const [medicines,setMedicines]=useState([]),[form,setForm]=useState({}),[editing,setEditing]=useState(null);
 const load=()=>axios.get(API).then(r=>setMedicines(r.data));
 useEffect(load,[]);
 const save=async(e)=>{e.preventDefault(); editing?await axios.put(API+'/'+editing,form):await axios.post(API,form);setForm({});setEditing(null);load();}
 const edit=m=>{setEditing(m.id);setForm(m)}
 const del=id=>axios.delete(API+'/'+id).then(load);
 return <div className="app"><header><h1>MEDISTOCK</h1><p>Smart Medicine Inventory, Sales and Expiry Management System</p></header>
 <main><section className="card"><h2>{editing?'Update Medicine':'Add Medicine / Tablet'}</h2><form onSubmit={save}>
 {['name','genericName','category','manufacturer','batchNumber','expiryDate','stockQuantity','reorderLevel','purchasePrice','sellingPrice'].map(k=>
 <input key={k} type={k.includes('Date')?'date':(k.includes('Quantity')||k.includes('Level')?'number': 'text')}
 placeholder={k} value={form[k]??''} onChange={e=>setForm({...form,[k]:e.target.value})} required/> )}
 <button>{editing?'Update':'Add Medicine'}</button>{editing&&<button type="button" onClick={()=>{setEditing(null);setForm({})}}>Cancel</button>}
 </form></section>
 <section className="card"><h2>Medicine Inventory</h2><table><thead><tr><th>Name</th><th>Category</th><th>Batch</th><th>Expiry</th><th>Stock</th><th>Buy</th><th>Sell</th><th>Action</th></tr></thead>
 <tbody>{medicines.map(m=><tr key={m.id}><td>{m.name}</td><td>{m.category}</td><td>{m.batchNumber}</td><td>{m.expiryDate}</td><td>{m.stockQuantity}</td><td>₹{m.purchasePrice}</td><td>₹{m.sellingPrice}</td><td><button onClick={()=>edit(m)}>Edit</button><button onClick={()=>del(m.id)}>Delete</button></td></tr>)}</tbody></table></section></main>
 </div>
}
createRoot(document.getElementById('root')).render(<App/>);
